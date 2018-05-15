var Maze = {
    BOARDSIZE: 19,
    HALFBOARD: 8,
    board: null,
    unit: 4,
    pointer: [0,0],

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
                }
            }
        }
        this.pointer = [0,0];
    },


    initialized: false
}