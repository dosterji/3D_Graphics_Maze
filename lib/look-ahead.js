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
    check: function(camera, initial_position, movement_direction, speed) {
        let ip = initial_position;
        let np; //new position

        switch(movement_direction) {
            case "N":  np = camera.checkWalk(-speed);
                       break;
            case "S":  np = camera.checkWalk(+speed);
                       break;
            case "W":  np = camera.checkTrack(-speed, 0.0);
                       break;
            case "E":  np = camera.checkTrack(+speed, 0.0);
                       break;
        }

        let result = Maze.canCross(ip, np);
        return result;
    },
}