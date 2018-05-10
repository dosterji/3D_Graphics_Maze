// The WebGL object
var gl;

// The HTML canvas
var canvas;

var grid;    // The reference grid
var axes;    // The coordinate axes
var camera;  // The camera

var light = vec3.create();    // The location of the light source.

var cubeMaterial = new Material();

var jumping = false;    // A boolean variable that tells the player if they are jumpning or not. 
var initial_vel = 0.2;  // variables used for jumping 
var current_vel;      

// Uniform variable locations
var uni = {
    uModel: null,
    uView: null,
    uProj: null,
    uEmissive: null, 
    uAmbient: null, 
    uDiffuse: null,
    uSpecular: null,
    uShine: null,
    uLightPos: null,
    uLightIntensity: null,
    uAmbientLight: null,
    uHasDiffuseTex: null,
    uDiffuseTex: null
};

/**
 * Initialize the WebGL context, load/compile shaders, and initialize our shapes.
 */
var init = function() {
    
    // Set up WebGL
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // Set the viewport transformation
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Set the background color
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    
    // Enable the z-buffer
    gl.enable(gl.DEPTH_TEST);

    // Load and compile shaders
    program = Utils.loadShaderProgram(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Find the uniform variable locations
    uni.uModel = gl.getUniformLocation(program, "uModel");
    uni.uView = gl.getUniformLocation(program, "uView");
    uni.uProj = gl.getUniformLocation(program, "uProj");

    // Material Properties
    uni.uEmissive = gl.getUniformLocation(program, "uEmissive");
    uni.uAmbient = gl.getUniformLocation(program, "uAmbient");
    uni.uDiffuse = gl.getUniformLocation(program, "uDiffuse");
    uni.uSpecular = gl.getUniformLocation(program, "uSpecular");
    uni.uShine = gl.getUniformLocation(program, "uShine");

    //Light Properties 
    uni.uLightPos = gl.getUniformLocation(program, "uLightPos");
    uni.uLightIntensity = gl.getUniformLocation(program, "uLightIntensity");
    uni.uAmbientLight = gl.getUniformLocation(program, "uAmbientLight");

    //Texture Properties 
    uni.uHasDiffuseTex = gl.getUniformLocation(program, "uHasDiffuseTex");
    uni.uDiffuseTex = gl.getUniformLocation(program, "uDiffuseTex");
    
    //set uniforms that do not change often
    //no idea what to set these to or how to set them, the program can't find uniform3fv
    gl.uniform3fv(uni.uLightIntensity, vec3.fromValues(3.0, 3.0, 3.0));
    gl.uniform3fv(uni.uAmbientLight, vec3.fromValues(0.1,0.1,0.1));

    gl.uniform1i(uni.uDiffuseTex, 0);

    cubeMaterial.diffuseTexture = "sad-boy.png";

    // Initialize our shapes
    Shapes.init(gl);
    grid = new Grid(gl, 20.0, 20, Float32Array.from([0.7,0.7,0.7]));
    axes = new Axes(gl, 2.5, 0.05);

    // Initialize the camera
    camera = new Camera( canvas.width / canvas.height );
    vec3.copy(light, camera.eye);          //start light position where camera is positioned

    setupEventHandlers();

    Promise.all([
        Utils.loadTexture(gl, "texs/sad-boy.png") //This calls throws an error in 412-Utils
    ]).then(function(val) {
        Textures["sad-boy.png"] = val[0];
        render();
    });
    //render();
};

/**
 * Render the scene!
 */
var render = function() {
    // Request another draw
    window.requestAnimFrame(render, canvas);

    // Update camera when in fly mode
    updateCamera();
    updateLight();

    // Clear the color and depth buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set projection and view matrices 
    gl.uniformMatrix4fv(uni.uView, false, camera.viewMatrix());
    gl.uniformMatrix4fv(uni.uProj, false, camera.projectionMatrix());

    drawLightSource();

    drawAxesAndGrid();
    drawScene();
};

/**
 * Draw the objects in the scene.  
 */
var drawScene = function() {
    let model = mat4.create();

    //create material
    let material = new Material(); 
    vec3.set(material.diffuse, 0.0, 0.3, 0.0);
    vec3.set(material.ambient, 0.0, 0.0, 0.0);
    vec3.set(material.specular, 0.0, 0.0, 0.0);

    //Floor 
    mat4.fromScaling(model, vec3.fromValues(18, 0.1, 18));
    gl.uniformMatrix4fv(uni.uModel, false, model);
    Shapes.cube.render(gl, uni, material);

    // Draw a red cube, translated
    material.diffuseTexture = "sad-boy.png";
    mat4.fromTranslation(model, vec3.fromValues(1.0,2.0,1.0));
    vec3.set(material.diffuse, 0.3, 0.0, 0.0);
    vec3.set(material.specular, 0.2, 0, 0);
    gl.uniformMatrix4fv(uni.uModel, false, model);
    Shapes.cube.render(gl, uni, material);

    // Draw a Disk
    //material.diffuseTexture = null;
    mat4.fromTranslation(model, vec3.fromValues(-1.0,0.1,1.0));
    mat4.scale(model, model, vec3.fromValues(.75, 1, .75));
    vec3.set(material.diffuse, 0.3, 0.3, 0.0);
    vec3.set(material.specular, 0.0, 0, 0);
    gl.uniformMatrix4fv(uni.uModel, false, model);
    Shapes.disk.render(gl, uni, material);

    //Draw a Cylinder 
    mat4.fromTranslation(model, vec3.fromValues(-1.0,0.0,-1.0));
    vec3.set(material.diffuse, 0.3, 0.0, 0.3);
    gl.uniformMatrix4fv(uni.uModel, false, model);
    Shapes.cylinder.render(gl, uni, material);

    //Top of Cylinder 
    mat4.fromTranslation(model, vec3.fromValues(-1.0, 1.01, -1.0));
    mat4.scale(model, model, vec3.fromValues(0.5, 1.0, 0.5));
    gl.uniformMatrix4fv(uni.uModel, false, model);
    Shapes.disk.render(gl, uni, material);

    //Draw a cone 
    material.diffuseTexture = null;
    mat4.fromTranslation(model, vec3.fromValues(1.0,0.0,-1.0));
    mat4.scale(model, model, vec3.fromValues(1.5, 1.5, 1.5));
    vec3.set(material.diffuse, 0.0, 0.3, 0.3);
    gl.uniformMatrix4fv(uni.uModel, false, model);
    Shapes.cone.render(gl, uni, material);

    //Set uLightPos
    let lightPos = vec3.create();
    vec3.copy(lightPos, light);
    let view_mat = camera.viewMatrix();
    
    let m = mat4.create();
    m[12]=lightPos[0];
    m[13]=lightPos[1];
    m[14]=lightPos[2];

    mat4.multiply(m, view_mat, m);
    lightPos[0] = m[12];
    lightPos[1] = m[13];
    lightPos[2] = m[14];

    gl.uniform3fv(uni.uLightPos, lightPos);
};

/**
 * A method for drawing the light source.
 */
var drawLightSource = function() {
    let model = mat4.create();

    mat4.fromTranslation(model, light);
    mat4.scale(model, model, vec3.fromValues(0.4, 0.4, 0.4));
    gl.uniformMatrix4fv(uni.uModel, false, model);

    //Create Material
    let material = new Material(); 
    vec3.set(material.diffuse, 0.0, 0.0, 0.0);
    vec3.set(material.ambient, 0.0, 0.0, 0.0);
    vec3.set(material.specular, 0.0, 0.0, 0.0);
    vec3.set(material.emissive, 1.0, 1.0, 1.0);
    Shapes.cube.render(gl, uni, material);
}

/**
 * Draws the reference grid and coordinate axes.
 */
var drawAxesAndGrid = function() {
    // Set model matrix to identity
    gl.uniformMatrix4fv(uni.uModel, false, mat4.create());
    // Draw grid
    grid.render(gl,uni);
    // Draw Axes
    axes.render(gl,uni);
};

//////////////////////////////////////////////////
// Event handlers
//////////////////////////////////////////////////

/**
 * An object used to represent the current state of the mouse.
 */
mouseState = {
    prevX: 0,     // position at the most recent previous mouse motion event
    prevY: 0, 
    x: 0,          // Current position
    y: 0,      
    button: 0,     // Left = 0, middle = 1, right = 2
    down: false,   // Whether or not a button is down
    wheelDelta: 0  // How much the mouse wheel was moved
};
var cameraMode = 0;          // Mouse = 0, Fly = 1
var downKeys = new Set();    // Keys currently pressed

var lightingMode = 0;       // Camera = 0, Local = 1;

var setupEventHandlers = function() {
    let modeSelect = document.getElementById("camera-mode-select");
    let lightingSelect = document.getElementById("lighting-mode-select");

    // Disable the context menu in the canvas in order to make use of
    // the right mouse button.
    canvas.addEventListener("contextmenu", function(e) {
        e.preventDefault();
    });

    modeSelect.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                cameraMode = 0;
            else if( val === "1" ) 
                cameraMode = 1;
        }
    );

    lightingSelect.addEventListener("change",
        function(e) {
            let val = e.target.value;
            if( val === "0" )
                lightingMode = 0;
            if( val === "1" )
                lightingMode = 1;
        })

    canvas.addEventListener("mousemove", 
        function(e) {
            if( mouseState.down ) {
                mouseState.x = e.pageX - this.offsetLeft;
                mouseState.y = e.pageY - this.offsetTop;
                mouseDrag();
                mouseState.prevX = mouseState.x;
                mouseState.prevY = mouseState.y;
            }
        });
    canvas.addEventListener("mousedown", function(e) {
        mouseState.x = e.pageX - this.offsetLeft;
        mouseState.y = e.pageY - this.offsetTop;    
        mouseState.down = true;
        mouseState.prevX = mouseState.x;
        mouseState.prevY = mouseState.y;
        mouseState.button = e.button;
    } );
    canvas.addEventListener("mouseup", function(e) {
        mouseState.x = e.pageX - this.offsetLeft;
        mouseState.y = e.pageY - this.offsetTop;
        mouseState.down = false;
        mouseState.prevX = 0;
        mouseState.prevY = 0;
    } );
    canvas.addEventListener("wheel", function(e) {
        e.preventDefault();
        mouseState.wheelDelta = e.deltaY;

        // Update camera if necessary.
        if(cameraMode === 1) { 
            camera.dolly(mouseState.wheelDelta/300);  //to smooth the change
        }
    });
    document.addEventListener("keydown", function(e) {
        downKeys.add(e.code);
    });
    document.addEventListener("keyup", function(e) {
        downKeys.delete(e.code);
        if(e.code === "KeyN") {
            camera = new Camera( canvas.width / canvas.height );
        }
    });
};

/**
 * Check the list of keys that are currently pressed (downKeys) and
 * update the camera appropriately.  This function is called 
 * from render() every frame.
 */
var updateCamera = function() {
    if(cameraMode === 0) {
        if(downKeys.has("Space")) {
            if(!jumping) {
                jumping=true;
                current_vel=initial_vel;
            }
        }
        if(downKeys.has("KeyW")) {
            camera.walk(-0.1);
        }
        if(downKeys.has("KeyS")) {
            camera.walk(+0.1);
        }
        if(downKeys.has("KeyA")) {
            camera.track(-0.1, 0.0);
        }
        if(downKeys.has("KeyD")) {
            camera.track(+0.1, 0.0);
        }
        if(downKeys.has("KeyQ")) {
            camera.track(0.0, +0.1);
        }
        if(downKeys.has("KeyE")) {
            camera.track(0.0, -0.1);
        }
        if(jumping) {
            current_vel = camera.jump(current_vel);
        }
        //camera methods for jumping
        console.log(camera.eye[1]);
        if(camera.eye[1] <= 0.7) {
            jumping = false;
        }
    }
};

/**
 * A method for updating the location of the light source
 */
var updateLight = function() {
    if(lightingMode == 1) {
        if(downKeys.has("ArrowUp")) {
            light[1]+=0.1;
        }
        if(downKeys.has("ArrowDown")) {
            light[1]-=0.1;
        }
        if(downKeys.has("ArrowRight")) {
            let dx = light[0] / (Math.abs(light[0])+Math.abs(light[2]));
            let dz = light[2] / (Math.abs(light[0])+Math.abs(light[2]));

            light[0] -= dx*0.1;
            light[2] -= dz*0.1;
        }
        if(downKeys.has("ArrowLeft")) {
            let dx = light[0] / (Math.abs(light[0])+Math.abs(light[2]));
            let dz = light[2] / (Math.abs(light[0])+Math.abs(light[2]));

            light[0] += dx*0.1;
            light[2] += dz*0.1;
        }
        if(downKeys.has("KeyR")) {
            let dy = 0.05;
            vec3.rotateY(light, light, vec3.fromValues(0, light[1], 0) , dy);
        }
    }
    if( lightingMode == 0 ) {
        vec3.copy(light, camera.eye);
    }
};

/**
 * Called when a mouse motion event occurs and a mouse button is 
 * currently down.
 */
var mouseDrag = function () {
    if(cameraMode === 1) {
        if(mouseState.button === 0) {
            camera.orbit(
                (mouseState.x-mouseState.prevX)/50,
                (mouseState.y-mouseState.prevY)/50
                );
        }
        if(mouseState.button === 2) {
            camera.track(
                -(mouseState.x-mouseState.prevX)/50,
                (mouseState.y-mouseState.prevY)/50
                );
        }
    }
    if(cameraMode === 0) {
        if(mouseState.button === 0) {
            camera.turn( 
                (mouseState.x-mouseState.prevX)/50,
                (mouseState.y-mouseState.prevY)/50
            );
        }
    }
};

// When the HTML document is loaded, call the init function.
window.addEventListener("load", init);