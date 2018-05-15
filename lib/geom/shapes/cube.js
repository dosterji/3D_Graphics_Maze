
/**
 * Generates TriangleMesh vertex data for a cube of a given side length,
 * centered at the origin.
 * 
 * @param {Number} side the length of a side of the cube
 */
var generateCubeData = function(side = 1.0) {

    var side2 = side * 0.5;

    var v = [
        // Front
        -side2,-side2,side2,  side2,-side2,side2,   side2,side2,side2,   -side2,side2,side2,
        // Right
        side2,-side2,side2,  side2,-side2,-side2,  side2,side2,-side2,   side2,side2,side2,
        // Back
        -side2,-side2,-side2, -side2,side2,-side2,  side2,side2,-side2,   side2,-side2,-side2,
        // Left
        -side2,-side2,side2,  -side2,side2,side2,   -side2,side2,-side2, -side2,-side2,-side2,
        // Bottom
        -side2,-side2,side2,  -side2,-side2,-side2, side2,-side2,-side2,  side2,-side2,side2,
        // Top
        -side2,side2,side2,   side2,side2,side2,    side2,side2,-side2,  -side2,side2,-side2
    ];

    var n = [
        // Front
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        // Right
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        // Back
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
        // Let
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        // Bottom
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
        // Top
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0
    ];

    var tc = [
        // Front
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Right
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Back
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Let
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Bottom
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Top
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
    ];

    var el = [
        0,1,2,0,2,3,
        4,5,6,4,6,7,
        8,9,10,8,10,11,
        12,13,14,12,14,15,
        16,17,18,16,18,19,
        20,21,22,20,22,23
    ];

    return {
        index: el,
        normal: n,
        position: v,
        texCoord: tc
    };
};