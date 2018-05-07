/**
 * An object containing common functions useful for most WebGL programs.
 */
var Utils = {

    /**
     * Loads, compiles and links a shader program where the source is available
     * in the DOM.  If errors occur, they are displayed in the developer console.
     * 
     * @param {WebGL2RenderingContext} gl the WebGL2RenderingContext object
     * @param {String} vertexShaderId the ID of the element in the DOM containing the vertex
     *              shader source code.
     * @param {String} fragmentShaderId the ID of the element in the DOM containing the fragment
     *              shader source code.
     * @return {WebGLProgram} the WebGLProgram object or null if compilation/linking failed.
     */
    loadShaderProgram: function( gl, vertexShaderId, fragmentShaderId ) {
        var vertShdr;
        var fragShdr;

        // Load/compile the vertex shader
        var vertElem = document.getElementById( vertexShaderId );
        if ( !vertElem ) {
            alert( "Unable to load vertex shader " + vertexShaderId );
            return null;
        } else {
            vertShdr = gl.createShader( gl.VERTEX_SHADER );
            gl.shaderSource( vertShdr, vertElem.text );
            gl.compileShader( vertShdr );
            if ( !gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS) ) {
                let lines = gl.getShaderInfoLog(vertShdr).split(/\r?\n/);
                console.error("Compilation of vertex shader failed:");
                console.group();
                for( let i = 0; i < lines.length; i++ )
                    console.error(lines[i]);
                console.groupEnd();
                alert( "Vertex shader failed to compile.  See console for error log." );
                return null;
            }
        }

        // Load and compile the fragment shader
        var fragElem = document.getElementById( fragmentShaderId );
        if ( !fragElem ) {
            alert( "Unable to load fragment shader " + fragmentShaderId );
            return null;
        } else {
            fragShdr = gl.createShader( gl.FRAGMENT_SHADER );
            gl.shaderSource( fragShdr, fragElem.text );
            gl.compileShader( fragShdr );
            if ( !gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS) ) {
                let lines = gl.getShaderInfoLog( fragShdr ).split(/\r?\n/);
                console.error("Compilation of fragment shader failed:");
                console.group();
                for( let i = 0; i < lines.length; i++ )
                    console.error(lines[i]);
                console.groupEnd();
                alert( "Fragment shader failed to compile. See console for error log." );
                return null;
            }
        }

        // Create a shader program, attach the stages, and link
        var program = gl.createProgram();
        gl.attachShader( program, vertShdr );
        gl.attachShader( program, fragShdr );
        gl.linkProgram( program );

        if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
            let lines = gl.getProgramInfoLog( program ).split(/\r?\n/);
            console.error("Shader program failed to link:");
            console.group();
            for( let i = 0; i < lines.length; i++ )
                console.error(lines[i]);
            console.groupEnd();
            alert( "Shader program failed to link.  See console for error log." );
            return null;
        }

        return program;
    },
    
    /**
     * Asynchronously loads a texture from a URL into WebGL.  This function
     * returns a Promise that will resolve to the WebGLTextureObject.
     *   
     * @param {WebGL2RenderingContext} gl the WebGL2RenderingContext object
     * @param {String} url the URL of the image file
     * @returns {Promise.<WebGLTextureObject>} a Promise that will resolve to
     *           the loaded WebGLTextureObject.
     */
    loadTexture: function(gl, url) {

        var createOpenGLTexture = function(image) {
            // Create the texture object
            const texture = gl.createTexture();
            //image.crossOrigin = window.location.origin; //attempting to fix the cross-origin problem
            // Bind to the texture and set texture parameters
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

            // Create storage and load the texture
            gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, image.width, image.height);
            //The below method throws the following error:
            //  Uncaught (in promise) DOMException: Failed to execute 'texSubImage2D' on 'WebGL2RenderingContext': 
            //  The image element contains cross-origin data, and may not be loaded.
            
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, image.width, image.height, gl.RGBA, gl.UNSIGNED_BYTE, image);
            
            console.log("Loaded texture: " + url + " (" + image.width + ", " + image.height + ")" );
            return texture;
        };

        return new Promise(function(resolve, reject) {
            var img = new Image();
            img.addEventListener('load', function() {resolve(img);});
            img.addEventListener('error', function() {
                alert("Unable to load texture " + url);
                reject("Unable to load texture " + url);
            });
            img.src = url;
        }).then(createOpenGLTexture);
    }
};
