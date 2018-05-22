
/**
 * This object stores the WebGLTexture objects for each texture.  They are
 * stored as properties in the object with the property name being the 
 * same as the texture file name.  
 */
var Textures = {

    // Store each loaded texture object here.  Use the file name as the 
    // property name for each, and the value should be the WebGLTexture object.

    init: function(gl) {

        Promise.all( [
            Utils.loadTexture(gl, "texs/sad-boy.png"),
            Utils.loadTexture(gl, "texs/Grass.png"),
            Utils.loadTexture(gl, "texs/cobble.png"),
            Utils.loadTexture(gl, "texs/sky.png"),
            Utils.loadTexture(gl, "texs/page.png")
           ]).then( function(values) {
            Textures["sad-texture"] = values[0],
            Textures["grass-texture"] = values[1],
            Textures["cobble-texture"] = values[2],
            Textures["sky-texture"] = values[3],
            Textures["page-texture"] = values[4],
            render();
        });
    }



};