/**
 * This is a siple class that just does the looking ahead for seeing if a wall is in a location
 */
var LookAhead = {


    /**
     * A method for checking if the player can move in a specific direction
     * 
     * @param {Object} camera the camera object
     * @param {vec3} initial_postion the current position of the camera
     * @param {string} movement_direction the direction the player is trying to move
     * @param {Number} speed the movement speed of the player
     * @return {Boolean} if the player can move forward
     */
    check: function(camera, initial_position, movement_direction, speed, ) {
        let ip = initial_position;
        let np; //new position
        let n;  //The number of iterations to look ahead based upon the speed of the player
        if(speed === 0.04)
            n=24;
        else if(speed === 0.08) 
            n=12;
        else 
            n=6;

        switch(movement_direction) { 
            case "N":  np = camera.checkWalk(-speed, camera.eye);
                       for(let i=0; i<n; i++) {
                         np = camera.checkWalk(-speed, np);
                       }
                       break;
            case "S":  np = camera.checkWalk(+speed, camera.eye);
                       for(let i=0; i<n; i++) {
                         np = camera.checkWalk(+speed, np);
                       }
                       break;
            case "W":  np = camera.checkTrack(-speed, 0.0, camera.eye);
                       for(let i=0; i<n; i++) {
                        np = camera.checkTrack(-speed, 0.0, np);
                       }
                       break;
            case "E":  np = camera.checkTrack(+speed, 0.0, camera.eye);
                       for(let i=0; i<n; i++) {
                        np = camera.checkTrack(+speed, 0.0, np);
                       }
                       break;
        }

        let result = Maze.canCross(ip, np);
        return result;
    },
}