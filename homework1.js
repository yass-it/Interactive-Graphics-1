"use strict";

var canvas;
var gl;
var framebuffer;

var numVertices  = 36;
var texSize = 64;
var texture;

var numChecks = 8;

var program;
var program2;

var c;

var flag = true;
var direction = true;

var color = new Uint8Array(4);

var rx;
var ry;
var rz;
var traslation_loc;
var tx = 0 ;
var ty = 0;
var tz = 0;
var scaling_loc;
var sx = 1.0;
var sy = 1.0;
var sz = 1.0;


var pointsArray = [];
var colorsArray = [];
 
var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 ),
];

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
];

//Point 4
var near = 0.3;
var far = 3.0;


var phi    = 0.0;
var radius = 1.5;
var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;

var mvMatrix, pMatrix;
var modelView, projection;
var eye;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);



//Point 5
var fovy = 45.0;
var aspect;
var orthoBool = true;
var aspect = 1.0;
//


//Poinit 6
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var lightPosition = vec4(0.3, 0.2, 0.8,0.0);



var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0;

var normalsArray = [];
// Point 7
var changeShading = true;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;

var theta = [45.0, 45.0, 45.0];

var thetaLoc;







function quad(a, b, c, d) {

    // Point 6
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);
    // *****

    //*** Abbiamo rimpizzato i colori on queli del materiale per svolgere il punto 6

     pointsArray.push(vertices[a]);
     //colorsArray.push(vertexColors[a]);
     normalsArray.push(normal);

     pointsArray.push(vertices[b]);
     //colorsArray.push(vertexColors[a]);
     normalsArray.push(normal);

     pointsArray.push(vertices[c]);
     //colorsArray.push(vertexColors[a]);
     normalsArray.push(normal);

     pointsArray.push(vertices[a]);
     //colorsArray.push(vertexColors[a]);
     normalsArray.push(normal);

     pointsArray.push(vertices[c]);
     //colorsArray.push(vertexColors[a]);
     normalsArray.push(normal);

     pointsArray.push(vertices[d]);
     //colorsArray.push(vertexColors[a]);
     normalsArray.push(normal);
}

// Each face determines two triangles

function colorCube()
{
   quad( 1, 0, 3, 2 );
   quad( 2, 3, 7, 6 );
   quad( 3, 0, 4, 7 );
   quad( 6, 5, 1, 2 );
   quad( 4, 5, 6, 7 );
   quad( 5, 4, 0, 1 );
}





window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    // var ctx = canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    // Point 5 -> define aspect
    aspect = canvas.width/canvas.height;

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    
    var texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0,
       gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.generateMipmap(gl.TEXTURE_2D);
    
    // Allocate a frame buffer object

    framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer);

// Attach color buffer

gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

// check for completeness

   var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
   if(status != gl.FRAMEBUFFER_COMPLETE) alert('Frame Buffer Not Complete');

gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    //

    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

   

    
    thetaLoc = gl.getUniformLocation(program, "theta");
     gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    
    canvas.addEventListener("mousedown", function(event){

        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.clear( gl.COLOR_BUFFER_BIT);
        gl.uniform3fv(thetaLoc, theta);
        for(var i=0; i<6; i++) {
            gl.uniform1i(gl.getUniformLocation(program, "i"), i+1);
            gl.drawArrays( gl.TRIANGLES, 6*i, 6 );
        }
        var x = event.clientX;
        var y = canvas.height -event.clientY;

        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);

        if(color[0]==255)
        if(color[1]==255) console.log("yellow");
        else if(color[2]==255) console.log("magenta");
        else console.log("red");
        else if(color[1]==255)
        if(color[2]==255) console.log("cyan");
        else console.log("green");
        else if(color[2]==255) console.log("blue");
        else console.log("background");
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.uniform1i(gl.getUniformLocation(program, "i"), 0);
        gl.clear( gl.COLOR_BUFFER_BIT );
        gl.uniform3fv(thetaLoc, theta);
        gl.drawArrays(gl.TRIANGLES, 0, 36);

    });

// Point 2 - Rotation

    //X AXIS

    rx = gl.getUniformLocation(program, "rx");


    //Y AXIS

    ry = gl.getUniformLocation(program, "ry");



    //Z AXIS

     rz = gl.getUniformLocation(program, "rz");

     // Traslation Matrix

    traslation_loc = gl.getUniformLocation(program , "traslation");

    // Scaling Matrix

    scaling_loc = gl.getUniformLocation(program , "scaling");

    // Projection and Model matrix
    modelView = gl.getUniformLocation( program, "modelView" );
    projection = gl.getUniformLocation( program, "projection" );


    //**************
    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
    document.getElementById("Direction").onclick = function() { direction = !direction;};
    document.getElementById( "slideX" ).oninput = function(){ tx = parseFloat(event.target.value,10); };
    document.getElementById( "slideY" ).oninput = function(){ ty = parseFloat(event.target.value,10); };
    document.getElementById( "slideZ" ).oninput = function(){ tz = parseFloat(event.target.value,10); };
    document.getElementById( "ScalingX" ).oninput = function(){ sx = parseFloat(event.target.value,10); };
    document.getElementById( "ScalingY" ).oninput = function(){ sy = parseFloat(event.target.value,10); };
    document.getElementById( "ScalingZ" ).oninput = function(){ sz = parseFloat(event.target.value,10); };
   // Point 5
    document.getElementById("zFarSlider").onchange = function() {
        far = event.srcElement.value;
    };

    document.getElementById("zNearSlider").onchange = function() {
        near = event.srcElement.value;
    };

    // POINT 7
    
    document.getElementById("ShadingButton").onclick = function(){changeShading = !changeShading;};
    //Point 6


   var ambientProduct = mult(lightAmbient, materialAmbient);
   var diffuseProduct = mult(lightDiffuse, materialDiffuse);
   var specularProduct = mult(lightSpecular, materialSpecular);
   gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
                  flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
                  flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program,"specularProduct"),
                  flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program,"lightPosition"),
                  flatten(lightPosition) );
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),materialShininess);

    
    render();
}

/////////////////////
var render = function() {


    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    if(flag) theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);
    gl.uniform1i(gl.getUniformLocation(program, "i"),0);
    gl.drawArrays( gl.TRIANGLES, 0, 36 );
    
    //Point 7
    gl.uniform1f(gl.getUniformLocation(program, "changeShading"),changeShading);





    // Point 3 -> Scaling

    var scaling = [sx , 0.0 , 0.0 , 0.0,
                   0.0  , sy, 0.0 , 0.0,
                   0.0 , 0.0 , sz , 0.0,
                   0.0 , 0.0 , 0.0 , 1];
    gl.uniformMatrix4fv(scaling_loc,false,scaling);


    // ****************************************
    //X AXIS - Point 2
    var theta_x_degree  = theta[0];
    var theta_x_radians = theta_x_degree * Math.PI / 180;
    var s_x = Math.sin(theta_x_radians);
    var c_x = Math.cos(theta_x_radians);
    var rx_loc = [ 1.0,  0.0,  0.0, 0.0,
                  0.0,  c_x,  s_x, 0.0,
                  0.0, -s_x,  c_x, 0.0,
                  0.0,  0.0,  0.0, 1.0 ];
    gl.uniformMatrix4fv(rx, false, rx_loc);

    //Y AXIS - Point 2
    var theta_y_degree  = theta[1];
    var theta_y_radians = theta_y_degree * Math.PI / 180;
    var s_y = Math.sin(theta_y_radians);
    var c_y = Math.cos(theta_y_radians);
    var ry_loc = [ c_y, 0.0, -s_y, 0.0,
                  0.0, 1.0,  0.0, 0.0,
                  s_y, 0.0,  c_y, 0.0,
                  0.0, 0.0,  0.0, 1.0 ];
    gl.uniformMatrix4fv(ry, false, ry_loc);


    //Z AXIS - Point 2
    var theta_z_degree  = theta[2];
    var theta_z_radians = theta_z_degree * Math.PI / 180;
    var s_z = Math.sin(theta_z_radians);
    var c_z = Math.cos(theta_z_radians);
    var rz_loc = [ c_z, s_z, 0.0, 0.0,
                  -s_z,  c_z, 0.0, 0.0,
                  0.0,  0.0, 1.0, 0.0,
                  0.0,  0.0, 0.0, 1.0  ];
    gl.uniformMatrix4fv(rz, false, rz_loc);

    // ****************************************

    // Point 3 -> Traslation

    var traslation = [1.0 , 0.0 , 0.0 , 0.0,
                      0.0 , 1.0 , 0.0 , 0.0,
                      0.0 , 0.0 , 1.0 , 0.0,
                       tx , ty , tz , 1.0];

    gl.uniformMatrix4fv(traslation_loc,false,traslation);
    


    // ****************************************

    //Point 4-5
    //*************************************
    
        function renderScene(drawX, drawY, drawWidth, drawHeight, pMatrix) {


        gl.enable(gl.SCISSOR_TEST);
        gl.viewport(drawX, drawY, drawWidth, drawHeight);
        gl.scissor(drawX, drawY,drawWidth, drawHeight);

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    
    eye = vec3(radius*Math.sin(theta_x_radians)*Math.cos(phi),
    radius*Math.sin(theta_y_radians)*Math.sin(phi), radius*Math.cos(theta_z_radians));

    mvMatrix = lookAt(eye, at , up);

    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}

    const width = gl.canvas.width;
    const height = gl.canvas.height;
    const displayWidth = gl.canvas.clientWidth;
    const displayHeight = gl.canvas.clientHeight;






// draw left
{
    const dispWidth = displayWidth / 2;
    const dispHeight = displayHeight;
    const aspect = dispWidth / dispHeight;
    const top = 1;
    const bottom = -top;
    const right = top * aspect;
    const left = -right;
    const pMatrix = ortho(left, right, bottom, top,  near, far);
    gl.clearColor(0.2, 0.2, 0.2, 1);

    renderScene(0, 0, width / 2, height, pMatrix);

  }

  // draw right
{
    const dispWidth = displayWidth / 2;
    const dispHeight = displayHeight;
    const aspect = dispWidth / dispHeight;
   

    const pMatrix = perspective(fovy, aspect,  near, far);
    gl.clearColor(0.1, 0.1, 0.1, 1);
    renderScene(width / 2, 0, width / 2, height, pMatrix);


  }



  requestAnimFrame(render);

}





