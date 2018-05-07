
/**
 * Constructor function for an ObjModel.  An ObjModel consists of a TriangleMesh
 * object that is broken up into several sub-meshes.  Each sub-mesh is associated
 * with its own material properties.
 * 
 * Note that this is intended to be called by
 * Obj.load(), you probably shouldn't need to call this directly.
 * 
 * @param {TriangleMesh} triMesh the TriangleMesh object containing all 
 *      vertex data for this OBJ model. 
 * @param {Array} meshes an array of objects containing information about
 *      each sub-mesh.  The objects in this array will have at least the following
 *      properties: nVerts (the number of indices in the sub-mesh), start (the
 *      starting index of the sub-mesh), and material (a Material object).
 * @param {string} file the relative URL of the obj file.
 */
var ObjModel = function(triMesh, meshes, file) {
    this.triangleData = triMesh;
    this.meshes = meshes;
    this.url = file;
};

/**
 * Draws this ObjMesh.
 * 
 * @param {WebGL2RenderingContext} gl the WebGL2RenderingContext object
 * @param {Object} uni an object containing uniform locations for the shader.
 */
ObjModel.prototype.render = function(gl, uni) {
    if( ! this.triangleData.vao ) return;

    gl.bindVertexArray(this.triangleData.vao);
    this.meshes.forEach( function(m)  {
        m.material.setUniforms(gl,uni);
        gl.drawElements(gl.TRIANGLES, m.nVerts, gl.UNSIGNED_INT, 4 * m.start);
    });
    gl.bindVertexArray(null);
};

/**
 * This module contains only a single public function: load.  It can be used
 * to asynchronously create an ObjModel from a file.
 */
var Obj = function() {

    /**
     * Loads an obj file and creates an ObjModel object.  Note that this OBJ loader
     * is not robust or complete.  It should handle many obj files but may not handle
     * all of them.  If you find any bugs, let me know, and I'll attempt to address
     * them.  Even better, determine a fix for the bug and then let me know!
     * 
     * @param {WebGL2RenderingContext} gl the WebGL2RenderingContext object
     * @param {String} url the URL of the obj file
     * @param {Number} scale the model will be scaled so that it fits in a box (cube) with a 
     *               side length of this value.  The box will be centered at the origin in 
     *               x and z, and the "bottom" (lower side in y) will be aligned with the 
     *               x-z plane.
     * @returns {Promise.<ObjModel>} a Promise that will resolve to an ObjModel
     */
    var load = function(gl,url,scale=1.0) {
        return fetch(url)
            .then(function(response) {
                if(response.ok) return response.text();
                else {
                    alert("Unable to load: " + url); 
                    return Promise.reject("File " + url + " not found.");
                }
            })
            .then(function(txt) { return loadObjData(gl, url, txt, scale); });
    };

    /**
     * (Private function) Loads data from an obj file.  This function is private
     * and cannot be called from external code.  Instead use load().
     * 
     * @param {WebGL2RenderingContext} gl the WebGL2RenderingContext object
     * @param {String} url the file's location
     * @param {String} text the contents of the obj file.
     * @param {Number} scale the scale factor
     * @returns {ObjModel} the ObjModel
     */
    var loadObjData = function(gl, url, text, scale) {
        var mtllib = "";
        var lines = text.split(/\r?\n/);
        var pos = [], norm = [], tc = [];
        var currentMaterial = "_______default_______";
        var materials = {};
        materials[currentMaterial] = {
            verts: []
        };

        // The bounding box for the mesh
        let bbox = { 
            min: vec3.fromValues( Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE), 
            max: vec3.fromValues(-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE),
            add: function(x, y, z) {
                this.min[0] = Math.min( x, this.min[0] );
                this.min[1] = Math.min( y, this.min[1] );
                this.min[2] = Math.min( z, this.min[2] );

                this.max[0] = Math.max( x, this.max[0] );
                this.max[1] = Math.max( y, this.max[1] );
                this.max[2] = Math.max( z, this.max[2] );
            }
        };

        for(let lineNum = 0; lineNum < lines.length; lineNum++) {
            let line = lines[lineNum];

            // Remove comments
            var commentLoc = line.indexOf("#");
            if( commentLoc >= 0 ) {
                line = line.substr(0, commentLoc);
            }
            line = line.trim();

            if( line.length > 0 ) {
                let parts = line.split(/\s+/);
                let command = parts[0];
                parts.shift();

                if (command === "mtllib") {
                    mtllib = line.substr(6).trim();
                } else if (command === "v") {
                    let x = parseFloat(parts[0]), y = parseFloat(parts[1]), z = parseFloat(parts[2]);
                    bbox.add(x,y,z);
                    pos.push(x, y, z);
                } else if (command ===  "vn") {
                    norm.push(parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2]));
                } else if (command === "f") {
                    let startVert = parseVertex(parts[0], pos.length / 3, norm.length / 3, tc.length / 2);
                    for (var i = 2; i < parts.length; i++) {  // Triangulate
                        materials[currentMaterial].verts.push(startVert);
                        let v1 = parseVertex(parts[i-1], pos.length / 3, norm.length / 3, tc.length / 2);
                        materials[currentMaterial].verts.push(v1);
                        let v2 = parseVertex(parts[i], pos.length / 3, norm.length / 3, tc.length / 2);
                        materials[currentMaterial].verts.push(v2);
                    }
                } else if (command === "usemtl") {
                    let m = line.substr(6).trim();
                    if (!( m in materials )) {
                        materials[m] = {
                            verts: []
                        };
                    }
                    currentMaterial = m;
                } else if (command === "vt") {
                    tc.push(parseFloat(parts[0]), parseFloat(parts[1]));
                }
            }
        }

        // Scale and translate positions to fit in scale box
        let diag = vec3.create();
        vec3.subtract( diag, bbox.max, bbox.min );
        let maxExtent = Math.max( diag[0], Math.max(diag[1], diag[2]) );
        let translate = vec3.fromValues( 
            -(bbox.max[0] + bbox.min[0]) / 2.0,
            -bbox.min[1],
            -(bbox.max[2] + bbox.min[2]) / 2.0
        );
        let scaleFactor = scale / (maxExtent / 2.0);
        for( let i = 0; i < pos.length; i+=3 ) {
            pos[i] = (pos[i] + translate[0]) * scaleFactor;
            pos[i+1] = (pos[i+1] + translate[1]) * scaleFactor;
            pos[i+2] = (pos[i+2] + translate[2]) * scaleFactor;
        }

        // Pack everything into an object for further processing, and convert to ObjModel.
        let model = objDataToObjModel( gl, {
            url: url,
            position: pos,
            normal: norm,
            tc: tc,
            mtllib: mtllib,
            materials: materials
        });

        // Load material library (if necessary)
        return loadMaterialLib(model);
    };

    /**
     * (Private function)
     * Converts obj data to our ObjModel format.
     * 
     * @param {WebGL2RenderingContext} gl the WebGL2RenderingContext object
     * @param {Object} objData data from loadObjData
     * @returns {ObjModel} the ObjModel object 
     */
    let objDataToObjModel = function(gl, objData) {
        let pos = [],
            normals = [],
            tc = [],
            meshes = [];

        // Delete any unused materials
        let vertCount = 0;
        for( k in objData.materials ) {
            let count = objData.materials[k].verts.length;
            if( count === 0 ) {
                delete objData.materials[k];
            } else {
                vertCount += count;
            }
        }

        let el = new Uint32Array(vertCount), vertHash = {};
        let startIdx = 0;
        for( k in objData.materials ) {
            let mat = objData.materials[k];
            let n = mat.verts.length;
            for (let i = 0; i < n; i++) {
                let vertStr = mat.verts[i].toString();
                if( vertStr in vertHash ) {
                    el[startIdx + i] = vertHash[vertStr];
                } else {
                    let v = mat.verts[i];
                    let vIdx = pos.length / 3;
                    let pIdx = v.p;
                    pos.push(objData.position[pIdx * 3 + 0]);
                    pos.push(objData.position[pIdx * 3 + 1]);
                    pos.push(objData.position[pIdx * 3 + 2]);
                    if( v.n !== -1) {
                        normals.push(objData.normal[v.n * 3 + 0]);
                        normals.push(objData.normal[v.n * 3 + 1]);
                        normals.push(objData.normal[v.n * 3 + 2]);
                    }
                    if( v.tc !== -1) {
                        tc.push(objData.tc[v.tc * 2 + 0]);
                        tc.push(objData.tc[v.tc * 2 + 1]);
                    }
                    el[startIdx + i] = vIdx;
                    vertHash[vertStr] = vIdx;
                }
            }

            meshes.push( {
                materialName: k,
                material: new Material(),
                start: startIdx,
                nVerts: n,
            });
            startIdx += n;
        }
        vertHash = null;  // GC ASAP

        let vertData = {};
        vertData.index = el;
        vertData.position = pos;
        vertData.normal = normals;
        if( tc.length > 0 ) vertData.texCoord = tc;

        if( normals.length === 0 ) {
            console.log("Normals not found in "+ objData.url + ", generating normals...");
            generateNormals(vertData);
        }

        let mesh = new TriangleMesh(gl, vertData);
        let mod = new ObjModel(mesh, meshes, objData.url);
        if( objData.mtllib ) mod.mtllib = objData.mtllib;

        console.log("Loaded mesh " + objData.url + ": " + 
            (vertData.index.length / 3) + " triangles, " +
            (vertData.position.length / 3) + " verts.");

        return mod;
    };

    /**
     * (Private function)
     * Generates averaged normals if they are not found in the OBJ file.
     * 
     * @param {Object} vertData vertex data
     */
    var generateNormals = function( vertData ) {
        vertData.normal = new Float32Array(vertData.position.length);
        vertData.normal.fill(0.0);
        let a = vec3.create(), b = vec3.create(), n = vec3.create(),
            p0 = vec3.create(), p1 = vec3.create(), p2 = vec3.create();
        for( let i = 0; i < vertData.index.length; i+= 3) {
            let idx0 = vertData.index[i];
            let idx1 = vertData.index[i+1];
            let idx2 = vertData.index[i+2];
            vec3.set(p0,
                vertData.position[3 * idx0 + 0],
                vertData.position[3 * idx0 + 1],
                vertData.position[3 * idx0 + 2]);
            vec3.set(p1,
                vertData.position[3 * idx1 + 0],
                vertData.position[3 * idx1 + 1],
                vertData.position[3 * idx1 + 2]);
            vec3.set(p2,
                vertData.position[3 * idx2 + 0],
                vertData.position[3 * idx2 + 1],
                vertData.position[3 * idx2 + 2]);
            vec3.subtract(a, p1, p0);
            vec3.subtract(b, p2, p0);
            vec3.cross(n, a, b);
            vec3.normalize(n, n);
            vertData.normal[3 * idx0 + 0] += n[0];
            vertData.normal[3 * idx0 + 1] += n[1];
            vertData.normal[3 * idx0 + 2] += n[2];
            vertData.normal[3 * idx1 + 0] += n[0];
            vertData.normal[3 * idx1 + 1] += n[1];
            vertData.normal[3 * idx1 + 2] += n[2];
            vertData.normal[3 * idx2 + 0] += n[0];
            vertData.normal[3 * idx2 + 1] += n[1];
            vertData.normal[3 * idx2 + 2] += n[2];
        }

        // Renormalize
        for( let i = 0; i < vertData.normal.length; i += 3 ) {
            vec3.set(n,
                vertData.normal[i + 0],
                vertData.normal[i + 1],
                vertData.normal[i + 2]
            );
            vec3.normalize(n,n);
            vertData.normal[i + 0] = n[0];
            vertData.normal[i + 1] = n[1];
            vertData.normal[i + 2] = n[2];
        }
    };

    var ObjVertex = function(p, n, tc) {
        this.p = p;
        this.n = n;
        this.tc = tc;
    };
    ObjVertex.prototype.toString = function() {
        return this.p + "/" + this.tc + "/" + this.n;
    };

    /**
     * (Private function) Parses a face vertex string.
     * 
     * @param {String} str the face vertex string
     * @param {Number} nPts the number of points read so far
     * @returns {Object} contains the indices of the position, normal, and
     *       texture coordinate as properties pIdx, nIdx and tcIdx.
     */
    var parseVertex = function(str, nPts, nNorm, nTc) {
        let vertParts = str.split(/\//);
        let pIdx = -1, nIdx = -1, tcIdx = -1;
        
        pIdx = parseInt(vertParts[0]);
        if( pIdx < 0 ) pIdx = nPts + pIdx;
        else pIdx = pIdx - 1;
        
        if( vertParts.length > 1 ) {
            if(vertParts[1].length > 0 ) {
                tcIdx = parseInt(vertParts[1]);
                if(tcIdx < 0 ) tcIdx = nTc + tcIdx;
                else tcIdx = tcIdx - 1;
            }
        }
        if( vertParts.length === 3 ) {
            nIdx = parseInt(vertParts[2]);
            if( nIdx < 0 ) nIdx = nNorm + nIdx;
            else nIdx = nIdx - 1;
        }

        return new ObjVertex(pIdx, nIdx, tcIdx);
    };

    /**
     * (Private function)
     * Parses the material library.
     * 
     * @param {String} text the contents of the .mtl file
     * @param {ObjModel} model the ObjModel
     */
    var parseMaterialLib = function(text, model) {
        var lines = text.split(/\r?\n/);
        let currentMesh = null;

        for(let lineNum = 0; lineNum < lines.length; lineNum++) {
            let line = lines[lineNum];

            // Remove comments
            var commentLoc = line.indexOf("#");
            if (commentLoc >= 0) {
                line = line.substr(0, commentLoc);
            }
            line = line.trim();

            if( line.length > 0 ) {
                let parts = line.split(/\s+/);
                let command = parts[0];
                parts.shift();

                if( command === "newmtl") {
                    let matName = line.substr( 6 ).trim();
                    let mesh = model.meshes.find( function(el) {return el.materialName === matName;});
                    if( mesh ) {
                        currentMesh = mesh;
                    }
                } else if( command === "Kd" ) {
                    if( currentMesh ) {
                        let r = parseFloat(parts[0]);
                        let g = parseFloat(parts[1]);
                        let b = parseFloat(parts[2]);
                        vec3.set( currentMesh.material.diffuse, r,g,b);
                    }
                } else if( command === "Ka" ) {
                    if( currentMesh ) {
                        let r = parseFloat(parts[0]);
                        let g = parseFloat(parts[1]);
                        let b = parseFloat(parts[2]);
                        vec3.set( currentMesh.material.ambient, r,g,b);
                    }
                } else if( command === "Ks" ) {
                    if( currentMesh ) {
                        let r = parseFloat(parts[0]);
                        let g = parseFloat(parts[1]);
                        let b = parseFloat(parts[2]);
                        vec3.set( currentMesh.material.specular, r,g,b);
                    }
                } else if( command === "Ns" ) {
                    if( currentMesh ) {
                        let f = parseFloat(parts[0]);
                        currentMesh.material.shine = f;
                    }
                } else if( command === "Ke" ) {
                    if( currentMesh ) {
                        let r = parseFloat(parts[0]);
                        let g = parseFloat(parts[1]);
                        let b = parseFloat(parts[2]);
                        vec3.set( currentMesh.material.emissive, r,g,b);
                    }
                } else if( command === "map_Kd") {
                    currentMesh.material.diffuseTexture = parts[0];
                } else if( command === "map_Ks") {
                    currentMesh.material.specularTexture = parts[0];
                }
            }
        }
    };

    /**
     * (Private function)
     * Attempts to load the material file.  If successful, material data is stored
     * in the ObjModel.
     * 
     * @param {ObjModel} model the ObjModel 
     * @returns {Promise.<ObjModel>} a promise that resolves to the ObjModel provided.
     */
    var loadMaterialLib = function(model) {
        if( "mtllib" in model ) {
            let base = model.url.substr(0, model.url.lastIndexOf("/") + 1);
            let url = base + model.mtllib;

            return fetch(url)
                .then(function(response) {
                    if (response.ok) {
                        console.log("Loaded material library " + url);
                        return response.text();
                    }
                    else {
                        console.log("Material library " + url + " not found.");
                        return "";
                    }
                })
                .then(function(txt) {
                    if( txt.length > 0 ) parseMaterialLib(txt, model);
                    return model;
                });
        }
        return Promise.resolve(model);
    };

    return {
        load: load
    };
}();

