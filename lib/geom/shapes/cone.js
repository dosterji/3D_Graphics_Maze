/**
 * Generates TriangleMesh vertex data for a cone of a given side length,
 * centered at the origin.
 * 
 * @param {Number} rad the radius of the cone
 * @param {Number} n the number of points to use to draw the shape. 
 *                      does not include center of circle or the top of the cone.
 * @param {Number} length the length of the cone
 */
var generateConeData = function(rad = 0.5, n = 30, length = 1.0) {

    var v = [];
    v.push(0, 0, 0);

    var angle_inc = (2*Math.PI)/n;
    let angle = 0;

    for(let i=0; i<n; i++) {
        z = rad*Math.cos(angle);    //find the y-coord
        x = rad*Math.sin(angle);    //find the x-coord
        y = 0;
        v.push(x, y, z);
        angle += angle_inc;         //increment the angle
    }
    v.push(0, length, 0);           //push the top

    var norm = [];
    /*norm.push(0, 0, 0);
    for(let i=0; i<n; i++) {
        norm.push(0, 0, 0);
    }
    norm.push(0, 0, 0);*/

    norm.push(0, 0, 0);
    let new_origin = vec3.fromValues(0, length, 0);
    for(let i=1; i<=n; i++) {
        let start = 3*i;
        let a = vec3.fromValues(
            v[start]-new_origin[0],
            v[start+1]-new_origin[1],
            v[start+2]-new_origin[2]
        );
        if(i==n)
            start = 3;
        else
            start = (i+1)*3
        let b = vec3.fromValues(
            v[start]-new_origin[0],
            v[start+1]-new_origin[1],
            v[start+2]-new_origin[2]
        );
        let out = vec3.create();
        vec3.cross(out, a, b);
        vec3.normalize(out, out);
        norm.push(out[0], out[1], out[2]);
    }
    norm.push(0, 1, 0);

    var el = [];
    for(let i=1; i<n+1; i++) {
        let coord2 = (i+1)%(n+1);   //Find the second coordinate
        if(coord2==0) 
            coord2=1;
        el.push(coord2, i, 0);      //coords for triangle of circle
        el.push(i, coord2, n+1);      //coords for triangle on cone side
    }

    return {
        index: el,
        normal: norm,
        position: v,
    };
};