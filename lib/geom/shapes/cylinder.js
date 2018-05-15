/**
 * Generates TriangleMesh vertex data for a cylinder of a given side length,
 * centered at the origin.
 * 
 * @param {Number} rect the amount of rectangles that make up the cylinder
 * @param {Number} length the length of the cylinder
 */
var generateCylinderData = function(origin = 0, rect = 20, length = 1) {
    var arr_pos = [];
    var arr_normal = [];
    var arr_index = [];
    var arr_tex = [];
    var x,z;
    var radius = .5;
    
    // Make array of points' positions and normal vectors
    var u, v = 0;
    var p;
    var first;
    for(var i = 0; i < rect; i ++){
        u = i/rect;
        var angle = (2 * Math.PI) * (u) ;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        arr_pos.push(x,length,z);
        first = vec3.fromValues(x,origin,z);

        // Make normals
        p = vec3.fromValues(x,0,z);
        vec3.normalize(p,p);
        arr_normal.push(p[0], p[1], p[2]);
        arr_tex.push(u, 1);

        v = 1;
        arr_pos.push(x,origin,z);
        arr_normal.push(p[0], p[1], p[2]);
        arr_tex.push(u, 0);
    }

    arr_pos.push(arr_pos[0], arr_pos[1], arr_pos[2]);
    arr_pos.push(arr_pos[3], arr_pos[4], arr_pos[5]);
    arr_normal.push(arr_normal[0], arr_normal[1], arr_normal[2]);
    arr_normal.push(arr_normal[0], arr_normal[1], arr_normal[2]);
    arr_tex.push(1,1,1,0);

    // Fill index array
    var a,b,c;
    var p1 = 0,p2 = 1;
    var rect2 = rect+2;
    for(var i = 0; i < rect; i++){
        a = (2*i+1)%(rect2*2);
        b = (p2+=1)%(rect2*2);
        c = p1%(rect2*2);
        arr_index.push(a,b,c);

        a = (2*i+1)%(rect2*2);
        b = (p2+=1)%(rect2*2);
        c = (p1+=2)%(rect2*2);
        arr_index.push(a,b,c)
    }

    a = (rect*2)-1;
    b = (rect*2);
    c = (rect*2)-2;
    arr_index.push(a,b,c);

    a = (rect*2)-1;
    b = (rect*2)+1;
    c = (rect*2);
    arr_index.push(a,b,c);




    console.log(arr_pos[120]+","+arr_pos[121]+","+arr_pos[122]);
    console.log(arr_pos[123]+","+arr_pos[124]+","+arr_pos[125]);


    return {
        index: arr_index,
        normal: arr_normal,
        position: arr_pos,
        texCoord: arr_tex
    };
}