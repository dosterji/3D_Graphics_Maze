/**
 * Generates TriangleMesh vertex data for a disk of a given side length,
 * centered at the origin.
 * 
 * @param {Number} radius radius of the of the disk
 * @param {Number} slices the amount of slices in the disk
 */
var generateDiskData = function(radius = .5, slices = 20) {
    var arr_pos = [];
    var arr_normal = [];
    var arr_index = [];
    var arr_tex = [];
    var x, y, z, u, v;

    // Make array of points' positions
    var theta = (2 * Math.PI) / slices;
    for(var i = 0; i < slices; i++){
        var angle = theta * i;
        x = Math.cos(angle) * radius;
        y = 0;
        z = Math.sin(angle) * radius;
        arr_pos.push(x,y,z);
        arr_normal.push(0,1,0);

        u = 0.5 + (Math.cos(angle)*0.5);
        v = 0.5 + (Math.sin(angle)*0.5);
        arr_tex.push(u,v);
    }  
    arr_pos.push(0,0,0);
    arr_normal.push(0,1,0);
    arr_tex.push(.5,.5);

    // Fill index array
    for(var i = 0; i < slices; i++){
        arr_index.push(slices, i, (i+1)%slices )
    }

    
    return {
        index: arr_index,
        normal: arr_normal,
        position: arr_pos,
        texCoord: arr_tex
    };

}