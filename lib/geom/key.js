/**
 * This is just a formal name for a bunny.  
 * The keys to the doors in the game will consist of a 
 * rendered bunny_max_res.obj object and it will be colored
 * according to the door that it opens.  
 *  
 */
var Key = function(x, z, color) {
    // fields & default values
    this.shape = null;
    this.color = vec3.create();
    this.picked_up = false;
    this.location = vec3.create();

    // setting fields to defaul values
    this.shape = Shapes.bunny;
    console.log("Shape: " + this.shape);
    this.color = color;
    this.location = vec3.fromValues(x, 15, z);

    // setting material for key
    vec3.set(Shapes.bunny.meshes[0].material.diffuse, color[0], color[1], color[2]);
    vec3.set(Shapes.bunny.meshes[0].material.specular, 0.0, 0, 0);

    console.log("Made bunny: "+Shapes.bunny);
};

    /**
     * A function for rendering the key
     */
Key.prototype.render = function(gl, uni) {       
    if(!this.picked_up) {
        var model = mat4.create();
        mat4.fromTranslation(model, this.location);
        gl.uniformMatrix4fv(uni.uModel, false, model);
        Shapes.bunny.render(gl, uni);
    }
};

Key.prototype.pickUp = function() {
    this.picked_up = true;
};
