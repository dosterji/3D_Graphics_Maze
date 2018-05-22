var Maze = {
    BOARDSIZE: 19,
    HALFBOARD: 8,
    board: null,
    unit: 4,
    pointer: [0,0],
    doorsLeft: [],

    init: function() {
        this.board = [
            ["NW" ,"N"  ,"NE" ,"N"  ,"NE" ,"N"  ,"NS" ,"NS" ,"NE" ,"NS" ,"N"  ,"NS" ,"NS" ,"NE" ,"N  ","NS" ,"NSE","N"  ,"NE" ], // 0
            ["W"  ,""   ,""   ,""   ,"E"  ,"S"   ,"S"  ,"E"  ,""   ,"S"  ,"SE" ,""   ,"SE" ,"E"  ,""   ,"S"  ,"S"  ,"SE" ,"SE" ],
            ["SW" ,"S"  ,"E"  ,""   ,""   ,""   ,"S"  ,"SE" ,""   ,"S"  ,"S"  ,"E"  ,""   ,""   ,""   ,""   ,"S"  ,"S"  ,"E"],
            ["W"  ,"F"  ,"F"  ,"F"  ,"F"  ,"F"  ,""   ,""   ,""   ,""   ,""   ,"F"  ,"F"  ,"F"  ,"F"  ,"F"  ,""   ,""   ,"E"],
            ["W"  ,"F"  ,"S"  ,""   ,"S"  ,"S"  ,""   ,""   ,""   ,""   ,""   ,"S"  ,"S"  ,"S"  ,"S"  ,"E"  ,""   ,""   ,"E"],
            ["W"  ,"F"  ,""   ,""   ,""   ,"E"  ,""   ,""   ,""   ,""   ,"E"  ,""   ,""   ,""   ,""   ,"E"  ,"S"  ,"S"  ,"SE"],// 5
            ["W"  ,"F"  ,""   ,""   ,"E"  ,"E"  ,"S"  ,""   ,""   ,""   ,"SE" ,""   ,""   ,"S"  ,"S"  ,"S"  ,"S"  ,"S"  ,"E"], 
            ["W"  ,"F"  ,"S"  ,""   ,"SE" ,"S"  ,"E"  ,""   ,"F"  ,"F"  ,""   ,""   ,""   ,"E"  ,""   ,"S"  ,"S"  ,"E"  ,"E"],
            ["W"  ,"F"  ,""   ,""   ,""   ,"E"  ,"E"  ,""   ,"F"  ,"F"  ,"S"  ,"S"  ,"S"  ,"SE" ,"E"  ,""   ,"E"  ,"E"  ,"E"],
            ["W"  ,"F"  ,"S"  ,"S"  ,"S"  ,"E"  ,"SE" ,""   ,"F"  ,"F"  ,"S"  ,"S"  ,"S"  ,"SE" ,"S"  ,""   ,"E"  ,"E"  ,"E"],
            ["W"  ,"F"  ,""   ,"E"  ,""   ,""   ,"E"  ,"E"  ,""   ,""   ,""   ,""   ,""   ,""   ,"E"  ,""   ,"SE" ,"E"  ,"E"],// 10
            ["W"  ,"F"  ,""   ,"E"  ,""   ,""   ,"E"  ,"E"  ,""   ,"F"  ,"S"  ,"S"  ,"S"  ,"S"  ,"SE" ,"E"  ,""   ,"SE" ,"E"],
            ["W"  ,"F"  ,"S"  ,"S"  ,"S"  ,"S"  ,"SE" ,"E"  ,"S"  ,"S"  ,"S"  ,"S"  ,"S"  ,"S"  ,"S"  ,"SE" ,"S"  ,"S"  ,"SE"],
            ["WE" ,""   ,""   ,""   ,"E"  ,""   ,""   ,""   ,""   ,""   ,""   ,""   ,""   ,""   ,"E"  ,""   ,""   ,""   ,"E"],
            ["WE" ,""   ,""   ,""   ,"E"  ,"S"  ,"S"  ,"S"  ,"S"  ,"S"  ,"S"  ,"S"  ,"S"  ,""   ,"E"  ,""   ,""   ,""   ,"E"],
            ["W"  ,""   ,"E"  ,""   ,""   ,""   ,"E"  ,""   ,""   ,""   ,""   ,""   ,"E"  ,""   ,""   ,""   ,"E"  ,""   ,"E"], // 15
            ["SW" ,"S"  ,"SE" ,"S"  ,"S"  ,""   ,"E"  ,""   ,""   ,"S"  ,"S"  ,"S"  ,"SE" ,""   ,""   ,"S"  ,"SE" ,""   ,"E"],
            ["W"  ,""   ,""   ,""   ,""   ,""   ,""   ,""   ,""   ,""   ,""   ,""   ,""   ,""   ,"E"  ,""   ,""   ,""   ,"E"],
            ["SW" ,"S"  ,"S"  ,"S"  ,"S"  ,"S"  ,"S"  ,"S"  ,"S"  ,"S"  ,"S"  ,"S"  ,"S"  ,"S  ","SE" ,"S"  ,"S"  ,"S"  ,"SE"], // 18

        ];

        this.material = new Material();
        this.material.diffuseTexture = "cobble-texture";
        vec3.set(this.material.diffuse, .5, .5, .5);
        vec3.set(this.material.specular, 0, 0, 0);

        this.floorMaterial = new Material();
        this.floorMaterial.diffuseTexture = "grass-texture";
        vec3.set(this.floorMaterial.diffuse, .5, .5, .5);
        vec3.set(this.floorMaterial.specular, 0, 0, 0);

        
        
        //Set up doors ["Green", "Blue", ]
        this.doorsLeft[0] = new Door("green", "E", [2,1]);
        this.doorsLeft[1] = new Door("blue", "S", [8,2]);
        this.doorsLeft[2] = new Door("red", "S", [7,6]);
        this.doorsLeft[3] = new Door("purple", "N", [0,0]);
        this.initialized = true
        console.log("done building maze");
    },

    render: function( gl, uni ) {

        var sqr;
        var x,y,z,px,pz;
        var model = mat4.create();
        for(var i = 0; i < this.BOARDSIZE; i++){
            for(var j = 0; j < this.BOARDSIZE; j++){
                sqr = this.board[j][i];
                px = (i - this.HALFBOARD)*this.unit;
                py = (j - this.HALFBOARD)*this.unit;
                this.pointer = [px,py];
                y = this.unit


                if(sqr.includes("N")){
                    // Make north wall
                    x = this.pointer[0];
                    z = this.pointer[1] - (this.unit/2);
                    mat4.fromTranslation(model,vec3.fromValues(x,y,z)); // tranlation
                    mat4.scale(model,model,vec3.fromValues(this.unit,2*this.unit,.002)); // Scale
                    gl.uniformMatrix4fv(uni.uModel, false, model);
                    Shapes.cube.render(gl, uni, this.material);
                }
                if(sqr.includes("E")){
                    // Make East wall
                    x = this.pointer[0] + (this.unit/2);
                    z = this.pointer[1];
                    mat4.fromTranslation(model,vec3.fromValues(x,y,z)); // tranlation
                    mat4.scale(model,model,vec3.fromValues(.002,2*this.unit,this.unit)); // Scale
                    gl.uniformMatrix4fv(uni.uModel, false, model);
                    Shapes.cube.render(gl, uni, this.material);
                }
                if(sqr.includes("S")){
                    // Make South wall
                    x = this.pointer[0];
                    z = this.pointer[1] + (this.unit/2);
                    mat4.fromTranslation(model,vec3.fromValues(x,y,z)); // tranlation
                    mat4.scale(model,model,vec3.fromValues(this.unit,2*this.unit,.002)); // Scale
                    gl.uniformMatrix4fv(uni.uModel, false, model);
                    Shapes.cube.render(gl, uni, this.material);
                }
                if(sqr.includes("W")){
                    // Make West wall
                    x = this.pointer[0] - (this.unit/2);
                    z = this.pointer[1];
                    mat4.fromTranslation(model,vec3.fromValues(x,y,z)); // tranlation
                    mat4.scale(model,model,vec3.fromValues(.002,2*this.unit,this.unit)); // Scale
                    gl.uniformMatrix4fv(uni.uModel, false, model);
                    Shapes.cube.render(gl, uni, this.material);
                }
                if(sqr.includes("F")){
                    // Make full cube
                    x = this.pointer[0];
                    z = this.pointer[1];
                    mat4.fromTranslation(model,vec3.fromValues(x,y,z)); // tranlation
                    mat4.scale(model,model,vec3.fromValues(this.unit,2*this.unit,this.unit)); // Scale
                    gl.uniformMatrix4fv(uni.uModel, false, model);
                    Shapes.cube.render(gl, uni, this.material);
                }else{
                    // Make a floor
                    x = this.pointer[0];
                    z = this.pointer[1];
                    mat4.fromTranslation(model,vec3.fromValues(x,0,z)); // tranlation
                    mat4.scale(model,model,vec3.fromValues(this.unit,.001,this.unit)); // Scale
                    gl.uniformMatrix4fv(uni.uModel, false, model);
                    Shapes.cube.render(gl, uni, this.floorMaterial);
                }
            }
        }
        this.pointer = [0,0];
    },

    openDoor: function(color){
        switch(color){
            case "Red":
                if(this.doorsLeft.includes("Red"))
                    this.doorsLeft.splice(this.doorsLeft.indexOf("Red"),1);
                break;
            case "Blue":
                if(this.doorsLeft.includes("Blue"))
                    this.doorsLeft.splice(this.doorsLeft.indexOf("Blue"),1);
                break;
            case "Green":
                if(this.doorsLeft.includes("Green"))
                    this.doorsLeft.splice(this.doorsLeft.indexOf("Green"),1);
                break;
            case "Purple":
                if(this.doorsLeft.includes("Purple"))
                    this.doorsLeft.splice(this.doorsLeft.indexOf("Purple"),1);
                break;
        }
    },

    drawDoors: function(gl, uni){
        for(let i = 0; i < this.doorsLeft.length; i++){
            this.doorsLeft[i].render(gl,uni);
        }
    },

    /**
     * A method for determining if a door should open.  
     * Changes the door's open field. 
     * 
     * @param {array} inventory an array of strings that represents the player's inventory
     * @param {vec3} eye the player's position
     */
    checkDoors: function(inventory, eye) {
        player_position = vec3.create();
        vec3.copy(player_position, eye);
        player_position[1]=0;

        for(let i=0; i<this.doorsLeft.length; i++) {
            if(inventory.includes(this.doorsLeft[i].color) && 
                this.distance(player_position, this.doorsLeft[i].getLocation()) < 3) {
                    
                    this.doorsLeft[i].openDoor();
            }
        }
    },

    /**
     * A method that finds the distance between two points.  
     * 
     * @param {Vec3} player_location 
     * @param {Vec3} door_location 
     * 
     * @return {Number} a value representing the distance between the two objects.
     */
    distance: function(player_location, door_location) {
    let first = Math.pow(player_location[0]-door_location[0], 2);
    let second = Math.pow(player_location[1]-door_location[1], 2);
    let third = Math.pow(player_location[2]-door_location[2], 2);

    let result = Math.sqrt(first+second+third);
    return Math.abs(result);
    },

    getQuad: function(pos){
        //divide by unit and OR with 0

        
        var x = pos[0];
        var z = pos[2];
        x = (x-this.unit/2) / 4;
        z = (z-this.unit/2) / 4;

        if(x > 0){
            x++;
        }
        if(z > 0){
            z++;
        }

        x = (x|0) + this.HALFBOARD;
        z = (z|0) + this.HALFBOARD;


        return [x,z];

    },

    /**
     * A method for getting the world coordinates of a quadrant
     * 
     * @param {vec2} quad the quadrant
     */
    getCoord: function(quad) {
        let x = quad[0];
        let z = quad[1];

        x = x -this.HALFBOARD;
        z = z -this.HALFBOARD;

        x = x*4;
        z = z*4;

        return [x,z];
    },

    canCross: function(pos1,pos2){

        let start = this.getQuad(pos1);
        let end = this.getQuad(pos2);
        let delta = [(start[0] - end[0]), (start[1] - end[1])];
        let ret = false;

        //console.log("");
        //console.log("coords: "+(pos1[0]|0)+","+(pos1[2]|0));
        //console.log("start: "+start[0]+","+start[1]);
        //console.log("end: "+end[0]+","+end[1]);
        //console.log("delta: "+delta[0]+","+delta[1]);
        //console.log("start Maze: "+this.board[start[1]][start[0]]);
        //console.log("end Maze: "+this.board[end[1]][end[0]]);

        if(delta[0] === 0 && delta[1] === 0){
            ret = true;
        }else{
            if(delta[0] === -1){
                //Right
                if(this.board[start[1]][start[0]].includes("E") || this.board[end[1]][end[0]].includes("W") 
                                                                || this.board[end[1]][end[0]].includes("F")){
                    ret = false;
                }else{
                    ret = true;
                }
            }else if(delta[0] === 1){
                //Left
                if(this.board[start[1]][start[0]].includes("W") || this.board[end[1]][end[0]].includes("E")
                                                                || this.board[end[1]][end[0]].includes("F")){
                    ret = false;
                }else{
                    ret = true;
                }
            }else if(delta[1] === -1){
                //Down
                if(this.board[start[1]][start[0]].includes("S") || this.board[end[1]][end[0]].includes("N")
                                                                || this.board[end[1]][end[0]].includes("F")){
                    ret = false;
                }else{
                    ret = true;
                }
            }else if(delta[1] === 1){
                //Up
                if(this.board[start[1]][start[0]].includes("N") || this.board[end[1]][end[0]].includes("S")
                                                                || this.board[end[1]][end[0]].includes("F")){
                    ret = false;
                }else{
                    ret = true;
                }
            }
        }
        
        return ret;
    },


    initialized: false
}