
/**
 * This single object is designed to be a "library" of primitive shapes that we can use.
 * Initially, this object has only one property (the init function).  After the init
 * function is called, it will have a property for each of the primitive shapes.  The
 * init function should be called only once.
 */
var Shapes = {
    /**
     * This function initializes all primitive shapes and makes them available.
     * 
     * @param{WebGL2RenderingContext} gl
     */
    init: function(gl) {
        if( this.initialized ) return;

        // Cube
        this.cube = new TriangleMesh(gl, generateCubeData());

        // Disk
        this.disk = new TriangleMesh(gl, generateDiskData());

        // Cone 
        this.cone = new TriangleMesh(gl, generateConeData());

        //cylinder
        this.cylinder = new TriangleMesh(gl, generateCylinderData());
    
        this.initialized = true;
    },
    initialized: false
};