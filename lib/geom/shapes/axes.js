/**
 * Constructor function for an object that can be used to draw the coordinate axes.
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {Number} size the length of the axes 
 * @param {Number} width the width of the axes
 */
var Axes = function( gl, size, width ) {

    // We'll use these for the emissive property of the material for each axis
    this.xcolor = vec3.fromValues(1,0,0);
    this.ycolor = vec3.fromValues(0,1,0);
    this.zcolor = vec3.fromValues(0,0,1);

    // A material (used for all axes), with all properties set to (0,0,0)
    this.material = new Material();
    vec3.set(this.material.diffuse, 0,0,0);
    vec3.set(this.material.ambient, 0,0,0);
    vec3.set(this.material.specular, 0,0,0);

    var computeNormal = function( p, top ) {
        // Compute normal
        var temp = vec3.create();
        var n = vec3.create();
        var v = vec3.fromValues(0.0, p[1], p[2]);

        vec3.subtract(temp, top, p);
        vec3.cross(n, v, temp);
        vec3.cross(n, temp, n);
        vec3.normalize(n,n);

        return n;
    };

    this.yRot = mat4.create();
    this.zRot = mat4.create();
    mat4.fromRotation( this.yRot, Math.PI / 2.0, vec3.fromValues(0,0,1));
    mat4.fromRotation( this.zRot, -Math.PI / 2.0, vec3.fromValues(0,1,0));

    var w2 = width / 2.0;
    var pw2 = w2 * 1.9;
    var baseLen = size * 0.9;
    var pointerLen = size - baseLen;
    var top = vec3.fromValues(baseLen + pointerLen, 0.0, 0.0);

    var pos = [
        0, w2, w2, 0, -w2, w2, baseLen, -w2, w2, baseLen, w2, w2,
        0, w2, -w2, 0, -w2, -w2, baseLen, -w2, -w2, baseLen, w2, -w2,
        baseLen, pw2, pw2, baseLen, -pw2, pw2, baseLen, -pw2, -pw2, baseLen, pw2, -pw2,
        top[0], top[1], top[2], top[0], top[1], top[2], top[0], top[1], top[2], top[0], top[1], top[2]
    ];

    var r2 = 1.0 / Math.sqrt(2.0);
    var norm = [
        0, r2, r2, 0, -r2, r2, 0, -r2, r2, 0, r2, r2,
        0, r2, -r2, 0, -r2, -r2, 0, -r2, -r2, 0, r2, -r2,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // Compute these below
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0   // "
    ];

    var idx = [
        0, 1, 2, 0, 2, 3, // front
        4, 0, 3, 4, 3, 7, // top
        5, 4, 7, 5, 7, 6, // back
        1, 5, 6, 1, 6, 2, // bottom
        8, 9, 12, 9, 10, 13, 10, 11, 14, 11, 8, 15  // Cone
    ];

    for(let i = 8; i <= 11; i++ ) {
        let n = computeNormal( vec3.fromValues(pos[i*3], pos[i*3+1], pos[i*3+2]), top);
        norm[i*3] = n[0];
        norm[i*3+1] = n[1];
        norm[i*3+2] = n[2];
    }

    for(let i = 24; i <= 35; i+=3 ) {
        let index = idx[i] * 3;
        let a = vec3.fromValues(pos[index], pos[index+1], pos[index+2]);
        index = idx[i+1] * 3;
        let b = vec3.fromValues(pos[index], pos[index+1], pos[index+2]);
        index = idx[i+2] * 3;

        let va = vec3.create(), vb = vec3.create(), n = vec3.create();
        vec3.subtract(va, top, a);
        vec3.subtract(vb, vb, va);
        vec3.cross(n, vb, va);
        vec3.normalize(n,n);

        norm[index] = n[0];
        norm[index+1] = n[1];
        norm[index+2] = n[2];
    }

    let vdata = {
        index: idx,
        normal: norm,
        position: pos    
    };

    this.axisMesh = new TriangleMesh(gl, vdata);
};

Axes.prototype.render = function( gl, uni ) {
    // x
    vec3.copy(this.material.emissive, this.xcolor);
    this.axisMesh.render(gl,uni,this.material);
    // y
    vec3.copy(this.material.emissive, this.ycolor);
    gl.uniformMatrix4fv( uni.uModel, false, this.yRot );
    this.axisMesh.render(gl,uni,this.material);
    // z
    vec3.copy(this.material.emissive, this.zcolor);
    gl.uniformMatrix4fv( uni.uModel, false, this.zRot );
    this.axisMesh.render(gl,uni,this.material);
};