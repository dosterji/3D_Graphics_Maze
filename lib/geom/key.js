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
        this.shape = Shapes.bunny_max_res;
        console.log("Shape: " + this.shape);
        this.color = color;
        this.location = vec3.fromValues(x, 10, z);
    },

    render: function(gl, uni) {
        Promise.all([
            Obj.load(gl, "media/bunny_max_res.obj"),
        ]).then( function(values) {
            Shapes.bunny_max_res = values[0];
            render2(gl, uni);
        });
    },
    /**
     * A function for rendering the key
     */
    render2: function(gl, uni) {
        shape = Shapes.bunny_max_res;
        if(!this.picked_up) {
            shape.render(gl, uni, Float32Array.from([0,1,0]));
        }
    },

    pickUp: function() {
        this.picked_up = true;
    },
}