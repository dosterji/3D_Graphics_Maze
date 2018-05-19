/**
 * This is just a formal name for a bunny.  
 * The keys to the doors in the game will consist of a 
 * rendered bunny_max_res.obj object and it will be colored
 * according to the door that it opens.  
 *  
 */
var Key = {

    shape: null,
    color: vec3.create(),
    picked_up: false,
    location: vec3.create(),

    /**
     * A function for setting up the shit for this key
     * 
     */
    init: function(x, z, color) {
        // setup other variables

        this.shape = Shapes.bunny;
        console.log("Shape: " + this.shape);
        this.color = color;
        this.location = vec3.fromValues(x, 15, z);

        vec3.set(Shapes.bunny.meshes[0].material.diffuse, 0.3, 0.3, 0.0);
        vec3.set(Shapes.bunny.meshes[0].material.specular, 0.0, 0, 0);
    },

    /**
     * A function for rendering the key
     */
    render: function(gl, uni) {
        
        if(!this.picked_up) {
            var model = mat4.create();
            mat4.fromTranslation(model, location);
            gl.uniformMatrix4fv(uni.uModel, false, model);
            Shapes.bunny.render(gl, uni);
        }
    },

    pickUp: function() {
        this.picked_up = true;
    },
}