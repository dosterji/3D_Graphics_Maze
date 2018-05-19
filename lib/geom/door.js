var Door = function(color, orientation, quadrant){

    this.color = color;
    this.orientation = orientation;
    this.quadrant = quadrant;
    
    this.material = new Material();
    this.model = mat4.create();
    this.unit = 4;

    //set up the model
    switch(this.color){
        case "red":
            vec3.set(this.material.diffuse, 0.7, 0.0, 0.0);
            vec3.set(this.material.specular, 0.7, 0.0, 0.0);
            break;
        case "blue":
            vec3.set(this.material.diffuse, 0.15, 0.15, 0.7);
            vec3.set(this.material.specular, 0.15, 0.15, 0.7);
            break;
        case "green":
            vec3.set(this.material.diffuse, 0.15, 0.7, 0.15);
            vec3.set(this.material.specular, 0.15, 0.7, 0.15);
            break;
        case "purple":
            vec3.set(this.material.diffuse, 0.5, 0.0, 0.5);
            vec3.set(this.material.specular, 0.5, 0.0, 0.5);
            break;
    }

    var pos = Maze.getCoord(quadrant);
    console.log("pos: "+pos);
    var x,y,z;

    switch(this.orientation){
        case "N":
            x = pos[0];
            y = this.unit;
            z = pos[1] - (this.unit/2);
            mat4.fromTranslation(this.model,vec3.fromValues(x,y,z)); // tranlation
            mat4.scale(this.model,this.model,vec3.fromValues(this.unit,2*this.unit,.002)); // Scale
            break;
        case "E":
            x = pos[0] + (this.unit/2);;
            y = this.unit;
            z = pos[1];
            mat4.fromTranslation(this.model,vec3.fromValues(x,y,z)); // tranlation
            mat4.scale(this.model,this.model,vec3.fromValues(.002,2*this.unit,this.unit)); // Scale
            break;
        case "S":
            x = pos[0];
            y = this.unit;
            z = pos[1] + (this.unit/2);;
            mat4.fromTranslation(this.model,vec3.fromValues(x,y,z)); // tranlation
            mat4.scale(this.model,this.model,vec3.fromValues(this.unit,2*this.unit,.002)); // Scale
            break;
        case "W":
            x = pos[0] - (this.unit/2);;
            y = this.unit;
            z = pos[1];
            mat4.fromTranslation(model,vec3.fromValues(x,y,z)); // tranlation
            mat4.scale(model,model,vec3.fromValues(.002,2*this.unit,this.unit)); // Scale
            break;
    }

    console.log("done makin this door: "+this);

    Door.prototype.render = function(gl, uni){
        gl.uniformMatrix4fv(uni.uModel, false, this.model);
        Shapes.cube.render(gl, uni, this.material);
    }

}