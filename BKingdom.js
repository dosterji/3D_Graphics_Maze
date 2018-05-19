// The WebGL object
var gl;

// The HTML canvas
var canvas;

var grid;    // The reference grid
var axes;    // The coordinate axes
var camera;  // The camera

var light = vec3.create();    // The location of the light source.

var cubeMaterial = new Material();

var walking_speed = 0.08;              //The variables used for walking 
var crouching_speed = 0.03;
var sprint_speed = 0.15;
var current_speed = walking_speed;

var jumping = false;    // A boolean variable that tells the player if they are jumpning or not. 
var initial_vel = 0.2;  // variables used for jumping 
var current_vel;      

var crouching = false;      //boolean: Is the player moving to a crouching position 
                                    // (holding keyC and not at crouching height)
var standing_up = false;    //boolean: Is the player standing up (released the c key)
var inMap = false;          //boolean: Is the player in the map view
var crouching_vel = 0.05;       

var keys = [];              //A list of the keys that exist
var inventory = [];         //A list of the keys that have been collected.  Keys are string values, e.g., inventory[i]="green";
var inventory_size = 0;

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
    gl.uniform3fv(uni.uLightIntensity, vec3.fromValues(0.7, 0.7, 0.7));
    gl.uniform3fv(uni.uAmbientLight, vec3.fromValues(0.5,0.5,0.2));

    gl.uniform1i(uni.uDiffuseTex, 0);

    // Initialize our shapes
    Shapes.init(gl);
    

    grid = new Grid(gl, 20.0, 20, Float32Array.from([0.7,0.7,0.7]));
    axes = new Axes(gl, 2.5, 0.05);
    Maze.init();
    

    // Initialize the camera
    camera = new Camera( canvas.width / canvas.height );
    vec3.copy(light, camera.eye);          //start light position where camera is positioned

    // Initialize the textures
    Textures.init(gl);

    setupEventHandlers();

    // For loading the bunnies

    Promise.all([
        Obj.load(gl, "media/bunny_max_res.obj"),
        Obj.load(gl, "media/bunny_max_res.obj"),
        Obj.load(gl, "media/bunny_max_res.obj"),
        Obj.load(gl, "media/bunny_max_res.obj"),
    ]).then( function(values) {
        Shapes.bunny0 = values[0];
        Shapes.bunny1 = values[1];
        Shapes.bunny2 = values[2];
        Shapes.bunny3 = values[3];

        let coord = Maze.getCoord([2,0]);
        //console.log(coord);
        keys[0] = new Key(coord[0], coord[1], vec3.fromValues(0, 1, 0));
        coord = Maze.getCoord([17,4]);
        //console.log(coord);
        keys[1] = new Key(coord[0], coord[1], vec3.fromValues(0, 0, 1));
        coord = Maze.getCoord([14,10]);
        //console.log(coord);
        keys[2] = new Key(coord[0], coord[1], vec3.fromValues(1, 0, 0));
        coord = Maze.getCoord([0,18]);
        //console.log(coord);
        keys[3] = new Key(coord[0], coord[1], vec3.fromValues(0.5, 0, 0.5));

        render();
    });
    
};

/**
 * Render the scene!
 */
var render = function() {
    // Request another draw
    window.requestAnimFrame(render, canvas);

    // Update camera when in fly mode
    updateCamera();
    updateInventory();
    updateLight();

    // Clear the color and depth buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set projection and view matrices 
    gl.uniformMatrix4fv(uni.uView, false, camera.viewMatrix());
    gl.uniformMatrix4fv(uni.uProj, false, camera.projectionMatrix());

    drawLightSource();

    //drawAxesAndGrid();
    
    drawScene();
    Maze.render(gl,uni);
    Maze.drawDoors(gl,uni);
    for(let i=0; i<keys.length; i++) {
        keys[i].render(gl, uni);
    } 
    console.log("Inventory: " +inventory);
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
    vec3.set(material.emissive, 1.0, 1.0, .5);
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

        if(!inMap){
            if(e.code === "KeyM"){
                camera.map();
                inMap = true;
            }
            if(e.code === "KeyC") {
                current_speed = crouching_speed;
                standing_up = false;
                crouching = true;
            }
            if(e.code === "ShiftLeft" && !crouching) {
                current_speed = sprint_speed;
                standing_up = false;
                crouching = false;
            }
        }

        if(e.code === "Space") {
            e.preventDefault();
        }
        
    });
    document.addEventListener("keyup", function(e) {
        downKeys.delete(e.code);
        if(e.code === "KeyM"){
            camera.returnFromMap();
            inMap = false;
        }
        if(e.code === "KeyN") {
            camera = new Camera( canvas.width / canvas.height );
        }
        if(e.code === "KeyC") {
            current_speed = walking_speed;
            crouching = false
            standing_up = true;
        }
        if(e.code === "ShiftLeft" && !crouching) {
            current_speed = walking_speed;
        }
    });
};

/**
 * Check the list of keys that are currently pressed (downKeys) and
 * update the camera appropriately.  This function is called 
 * from render() every frame.
 */
var updateCamera = function() {
    var startQuad = Maze.getQuad(camera.eye);
    
    let initial_position = vec3.create();
    vec3.copy(initial_position, camera.eye)

    if(cameraMode === 0 && !inMap) {
        // Starting a jump
        if(downKeys.has("Space")) {
            if(!jumping) {
                jumping=true;
                current_vel=initial_vel;
            }
        }
        // Basic movement controls.
        if(downKeys.has("KeyW")) {
            if(LookAhead.check(camera, initial_position, "N", current_speed))
                camera.walk(-current_speed);
        }
        if(downKeys.has("KeyS")) {
            if(LookAhead.check(camera, initial_position, "S", current_speed))
                camera.walk(+current_speed);
        }
        if(downKeys.has("KeyA")) {
            if(LookAhead.check(camera, initial_position, "W", current_speed))
                camera.track(-current_speed, 0.0);
        }
        if(downKeys.has("KeyD")) {
            if(LookAhead.check(camera, initial_position, "E", current_speed))
                camera.track(+current_speed, 0.0);
        }
        if(cameraMode === 1) {
            if(downKeys.has("KeyQ")) {
                camera.track(0.0, +0.1);
            }
            if(downKeys.has("KeyE")) {
                camera.track(0.0, -0.1);
            }
        }
        // Statements for jumping
        if(jumping) {
            current_vel = camera.jump(current_vel);
        }
        if(camera.eye[1] <= camera.standing_height) {
            jumping = false;
        }
        // Statements for crouching
        if(crouching && camera.eye[1] >= camera.crouching_height) {
            camera.crouch(crouching_vel);
        }
        // Statements for Standing up
        if(standing_up && camera.eye[1] <= camera.standing_height) {
            camera.uncrouch(crouching_vel);
        }
    }
    var endQuad = Maze.getQuad(camera.eye);

    if(startQuad[0] != endQuad[0] || startQuad[1] != endQuad[1]){
        //console.log("Crossed");
        Maze.openDoor("Green");
    }
};

/**
 * A function for adding bunnies to the player's inventory;
 */
var updateInventory = function() {
    let player_location = vec3.create();
    vec3.copy(player_location, camera.eye);
    player_location[1] = 0;
    for(let i=0; i<keys.length; i++) {
        if(!keys[i].picked_up && distance(player_location, keys[i].location)<1) {
            keys[i].pickUp();
            inventory[inventory_size] = keys[i].color_text;
            inventory_size++;
        }
    }
};

/**
 * A method that finds the distance between two points.  
 * 
 * @param {Vec3} player_location 
 * @param {Vec3} key_location 
 * 
 * @return {Number} a value representing the distance between the two objects.
 */
var distance = function(player_location, key_location) {
    let first = Math.pow(player_location[0]-key_location[0], 2);
    let second = Math.pow(player_location[1]-key_location[1], 2);
    let third = Math.pow(player_location[2]-key_location[2], 2);

    let result = Math.sqrt(first+second+third);
    return Math.abs(result);
}

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