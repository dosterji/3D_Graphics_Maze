/**
 * A constructor function for a Camera object.  Sets a default
 * camera frustum, position and orientation.
 * 
 * @param {Number} aspect camera's (viewport's) aspect ratio
 */
var Camera = function(aspect) {
    //
    // Parameters for the perspective frustum
    //
    this.fov = Math.PI / 3.0;     // The field of view
    this.near = 0.5;              // The distance to the near plane
    this.far = 200.0;             // The distance to the far plane
    this.aspect = aspect;         // The aspect ratio

    this.acceleration = 0.009;     // The acceleration due to gravity.

    this.standing_height = 0.7;
    this.crouching_height = 0.35;

    //
    // Parameters for the camera's position and orientation
    //
    this.eye = vec3.create();     // The camera's position
    this.returnEye = vec3.create(); // The position to return to from the map view

    // The camera's orientation as a rotation matrix.  This rotation should contain
    // the camera's u, v and n vectors in world space.  Should they be the first 
    // three rows or columns of this matrix?    
    this.rotation = mat4.create();
    this.returnRot = mat4.create();

    // Defaults for when the camera is reset (reset method)
    this.lookAt( vec3.fromValues(0, this.standing_height, 10), vec3.fromValues(0,0,0), vec3.fromValues(0,1,0) );
    this.defaultEye = vec3.clone( this.eye );
    this.defaultRotation = mat4.clone( this.rotation );
};

/**
 * Resets this camera to the default position and orientation.
 */
Camera.prototype.reset = function() {
    vec3.copy( this.eye, this.defaultEye );
    mat4.copy( this.rotation, this.defaultRotation );
};

Camera.prototype.map = function() {
    console.log("mapping");
    vec3.copy(this.returnEye, this.eye);
    mat4.copy(this.returnRot, this.rotation);
    this.lookAt(vec3.fromValues(0,60,0.001), vec3.fromValues(0,0,0), vec3.fromValues(0,1,0));

};
Camera.prototype.returnFromMap = function() {
    console.log("unMapping");
    vec3.copy(this.eye, this.returnEye);
    mat4.copy(this.rotation, this.returnRot);
    this.returnEye = vec3.create();
    this.returnRot= mat4.create();
};

/**
 * Set the position and orientation of this camera based on the
 * given parameters.  This method should only modify this.eye and
 * this.rotation.
 * 
 * @param {vec3} pos camera position
 * @param {vec3} at point that the camera is facing toward
 * @param {vec3} up the general upward direction for the camera 
 */
Camera.prototype.lookAt = function( pos, at, up ) {
    vec3.copy(this.eye, pos);

    let n = vec3.subtract(vec3.create(), pos, at);
    let u = vec3.cross(vec3.create(), up, n);
    let v = vec3.cross(vec3.create(), n, u);
    vec3.normalize(n,n);
    vec3.normalize(u,u);
    vec3.normalize(v,v);

    this.setRotation(u,v,n);
};

/**
 * Sets this camera's rotation matrix based on the camera's axes in 
 * world coordinates.
 * 
 * @param {vec3} u camera's u/x axis
 * @param {vec3} v camera's v/y axis
 * @param {vec3} n camera's n/z axis
 */
Camera.prototype.setRotation = function(u, v, n) {
    this.rotation[0] = u[0]; this.rotation[4] = u[1]; this.rotation[8] = u[2];
    this.rotation[1] = v[0]; this.rotation[5] = v[1]; this.rotation[9] = v[2];
    this.rotation[2] = n[0]; this.rotation[6] = n[1]; this.rotation[10] = n[2];
};

/**
 * Computes and returns the view matrix for this camera.  
 * Essentially the product of this.rotation and an appropriate
 * translation based on this.eye.
 * 
 * @returns {mat4} the view matrix for this camera
 */
Camera.prototype.viewMatrix = function() {
    let m = mat4.create();
    m[12] = -this.eye[0];
    m[13] = -this.eye[1];
    m[14] = -this.eye[2];

    return mat4.multiply(m, this.rotation, m);
};

/**
 * Computes and returns the projection matrix based on this camera.
 * @returns {mat4} the projection matrix.
 */
Camera.prototype.projectionMatrix = function() {
    return mat4.perspective(mat4.create(), this.fov, this.aspect, this.near, this.far);
};

/**
 * Orbits this camera object by changing this.eye and this.rotation.  
 * The mouse's delta x corresponds to a rotation around the world y axis, 
 * and the mouse's delta y corresponds to a rotation round the camera's 
 * x axis through the origin.
 * 
 * @param {Number} dx the change in the mouse's x coordinate
 * @param {Number} dy the change in the mouse's y coordinate
 */
Camera.prototype.orbit = function(dx, dy) {
    let yang = dx * 0.3;
    let xang = dy * 0.3;
    let camx = vec3.fromValues(
        this.rotation[0], this.rotation[4], this.rotation[8] 
    );

    let m = mat4.create();
    mat4.rotate(m, m, xang, camx);
    mat4.rotateY(m, m, yang);

    let curCam = this.viewMatrix();
    mat4.multiply(m, curCam, m);
    let u = vec3.fromValues( m[0], m[4], m[8] );
    let v = vec3.fromValues( m[1], m[5], m[9] );
    let n = vec3.fromValues( m[2], m[6], m[10] );
    this.setRotation(u,v,n);

    // Inverse rotation
    let minv = mat4.create();
    mat4.transpose(minv, this.rotation);
    
    let trans = mat4.create();
    mat4.multiply(trans, minv, m);
    this.eye[0] = -trans[12];
    this.eye[1] = -trans[13];
    this.eye[2] = -trans[14];
};

/**
 * Moves this camera along it's z/n axis.  Updates this.eye 
 * 
 * @param {Number} delta the mouse wheel's delta
 */
Camera.prototype.dolly = function(delta) {
    let d = delta * 0.75;
    let n = vec3.fromValues(this.rotation[2], this.rotation[6], this.rotation[10]);
    vec3.scaleAndAdd(this.eye, this.eye, n, d);
};

/**
 * A method similar to dolly wich allows the user to walk around.  
 * Updates this.eye
 * 
 * @param {Number} delta The forward motion delta
 */
Camera.prototype.walk = function(delta) {
    let d = delta * 0.75;

    let n = vec3.create();
    vec3.cross(n, vec3.fromValues(this.rotation[0], this.rotation[4], this.rotation[8]), vec3.fromValues(0,1,0));
    vec3.scaleAndAdd(this.eye, this.eye, n, d);
};

/**
 * Moves this camera along it's x/y axes.  Updates this.eye 
 * 
 * @param {Number} dx the change in the mouse's x coordinate
 * @param {Number} dy the change in the mouse's y coordinate
 */
Camera.prototype.track = function(dx, dy) {
    dx = dx * 0.75;
    dy = dy * 0.75;

    let v = vec3.create();
    let vx = vec3.fromValues(this.rotation[0], this.rotation[4], this.rotation[8]);
    vec3.scaleAndAdd(this.eye, this.eye, vx, dx);

    let vy = vec3.fromValues(this.rotation[1], this.rotation[5], this.rotation[9]);
    vec3.scaleAndAdd(this.eye, this.eye, vy, dy);
};

/**
 * Update this camera by changing rotating the camera's three axes.
 * The mouse's delta x corresponds to a rotation around the 
 * world y axis (0,1,0), the mouse's delta y corresponds to a rotation
 * around the camera's u/x axis.
 * 
 * @param {Number} dx the change in the mouse's x coordinate
 * @param {Number} dy the change in the mouse's y coordinate
 */
Camera.prototype.turn = function( dx, dy ) {
    dx = -dx * 0.3;
    dy = -dy * 0.3;

    let u = vec3.fromValues(this.rotation[0], this.rotation[4], this.rotation[8]);
    let v = vec3.fromValues(this.rotation[1], this.rotation[5], this.rotation[9]);
    let n = vec3.fromValues(this.rotation[2], this.rotation[6], this.rotation[10]);

    let m = mat4.create();

    // Rotate around u axis first, then rotate around global y axis.
    mat4.rotateY(m, m, dx);
    mat4.rotate(m, m, dy, u);

    vec3.transformMat4(u, u, m);
    vec3.transformMat4(v, v, m);
    vec3.transformMat4(n, n, m);

    this.setRotation(u,v,n);
};

/**
 * A method used to simulate jumping.  It updates this.eye and returns 
 * the current velocity.
 * 
 * @param {Number} velocity The upwards velocity
 */
Camera.prototype.jump = function(velocity) {

    if(velocity > -0.15){
        velocity = velocity - this.acceleration;
    }
    
    console.log(velocity);

    this.eye[1] += velocity;

    return velocity;
};

/**
 * Two methods used to crouch and stand up
 * 
 * @param {Number} vel The downwards velocity of the crouch 
 */
Camera.prototype.crouch = function(vel) {
    this.eye[1] -= vel;
};

/**
 * 
 * 
 * @param {Number} vel The upwards standing velocity of the character 
 */
Camera.prototype.uncrouch = function(vel) {
    this.eye[1] += vel;
};
