/**
 * A constructor for an object that can be used to draw a reference grid.
 * The grid is drawn in the x-z plane, with the given size and divisions.
 * It can be drawn by calling the render function.
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {Number} size the length of each side of the grid 
 * @param {Number} divs the number of divisions of the grid in each dimension
 * @param {Float32Array or vec3} color the color to draw the grid.
 */
var Grid = function( gl, size, divs, color ) {

    // Create a Material object with the emissive property set to color
    this.material = new Material();
    vec3.set(this.material.diffuse, 0,0,0);
    vec3.set(this.material.ambient, 0,0,0);
    vec3.set(this.material.specular, 0,0,0);
    vec3.copy(this.material.emissive, color);

    var w2 = size / 2.0;
    var divSize = size / divs;
    var pos = [], norm = [];
    for( var i = 0; i <= divs; i++ ) {
        var x = divSize * i - w2;
        pos.push(x, 0.0, w2);
        norm.push(0, 1, 0);
        pos.push(x, 0.0, -w2);
        norm.push(0, 1, 0);
    }
    for( var i = 0; i <= divs; i++ ) {
        var z = divSize * i - w2;
        pos.push(-w2, 0.0, z);
        norm.push(0, 1, 0);
        pos.push(w2, 0.0, z);
        norm.push(0, 1, 0);
    }

    this.nVerts = pos.length / 3;
    this.buffers = [];

    // Position buffer
    this.buffers[0] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(pos), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null); // done with this buffer

    // Normal buffer
    this.buffers[1] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(norm), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null); // done with this buffer

    // Setup VAO
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    // Set up the position pointer.  The position is bound to vertex attribute 0.
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(0);

    // Set up the normal pointer.  The normal is bound to vertex attribute 1.
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(1);

    gl.bindVertexArray(null); // Done with this VAO
};

/**
 * Draws the grid.
 * @param {WebGL2RenderingContext} gl 
 * @param {Object} uni the location of all of the shader's uniform variables
 */
Grid.prototype.render = function(gl, uni) {
    this.material.setUniforms(gl, uni);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.LINES, 0, this.nVerts);
    gl.bindVertexArray(null);
};

/**
 * Deletes all of the vertex data in WebGL memory for this object.  This invalidates the
 * vertex arrays, and the object can no longer be drawn.
 * @param {WebGL2RenderingContext} gl 
 */
Grid.prototype.deleteBuffers = function(gl) {
    // Delete all buffers
    for( let i in this.buffers ) {
        gl.deleteBuffer(this.buffers[i]);
    }
    this.buffers = [];

    // Delete the VAO
    if( this.vao ) {
        gl.deleteVertexArray(this.vao);
        this.vao = null;
    }
};