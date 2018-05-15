
/**
 * An object representing material properties for shading.
 */
var Material = function() {
    // Emissive component
    this.emissive = vec3.fromValues(0.0, 0.0, 0.0);
    // Ambient reflectivity
    this.ambient = vec3.fromValues(0.1, 0.1, 0.1);
    // Diffuse reflectivity
    this.diffuse = vec3.fromValues(0.7, 0.7, 0.7);
    // Specular reflectivity
    this.specular = vec3.fromValues(0.0, 0.0, 0.0);
    // Specular exponent
    this.shine = 1.0;
    // File name for diffuse texture or null if not using texture
    this.diffuseTexture = null;
};

/**
 * Set the uniforms in the shader to match the values stored in this object.
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {Object} uni the uniform variable locations 
 */
Material.prototype.setUniforms = function(gl, uni) {

    gl.uniform3fv(uni.uEmissive, this.emissive);
    gl.uniform3fv(uni.uAmbient, this.ambient);
    gl.uniform3fv(uni.uDiffuse, this.diffuse);
    gl.uniform3fv(uni.uSpecular, this.specular);
    gl.uniform1f(uni.uShine, this.shine);

    if( this.diffuseTexture !== null && this.diffuseTexture in Textures ) {
        gl.uniform1f(uni.uHasDiffuseTex, 1);
        gl.bindTexture(gl.TEXTURE_2D, Textures[this.diffuseTexture]);
    } else {
        gl.uniform1f(uni.uHasDiffuseTex, 0);
    }
};