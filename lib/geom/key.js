/**
 * This is just a formal name for a bunny.  
 * The keys to the doors in the game will consist of a 
 * rendered bunny_max_res.obj object and it will be colored
 * according to the door that it opens.   
 */
var Key = function(x, z, color) {
    // fields & default values
    this.shape = null;
    this.color = vec3.create();
    this.picked_up = false;
    this.location = vec3.create();
    this.color_text = "";           //the text name of the color

    // setting fields to defaul values
    console.log("Shape: " + this.shape);
    this.color = color;
    this.location = vec3.fromValues(x, 0, z);

    //Determine which mesh to use to draw the bunny
    if(this.color[1] === 1) {
        this.shape = Shapes.bunny0;
        this.color_text = "green";
    }
    else if( this.color[2] === 1 && this.color[0] === 0) {
        this.shape = Shapes.bunny1;
        this.color_text = "blue";
    }
    else if( this.color[0] === 1 && this.color[2] === 0) {
        this.shape = Shapes.bunny2;
        this.color_text = "red";
    }
    else {
        this.shape = Shapes.bunny3;
        this.color_text = "purple";
    }

    // setting material for key
    vec3.set(this.shape.meshes[0].material.diffuse, color[0], color[1], color[2]);
    vec3.set(this.shape.meshes[0].material.specular, 0.0, 0, 0);
};

    /**
     * A function for rendering the key
     */
Key.prototype.render = function(gl, uni) {       
    if(!this.picked_up) {
        var model = mat4.create();
        mat4.fromTranslation(model, this.location);
        mat4.scale(model, model, vec3.fromValues(0.25,0.25,0.25));
        gl.uniformMatrix4fv(uni.uModel, false, model);
        this.shape.render(gl, uni);
    }
};

Key.prototype.pickUp = function() {
    this.picked_up = true;
};
