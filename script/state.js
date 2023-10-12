let State = class State {
    constructor(level, status) {
        this.level = level;
        this.player = level.player;
        //this.rocks = rocks;
        //this.goal = goal;
        this.status = status;
    } 
}

State.prototype.update = function(time, keys, display) {
    let player = this.player;
    player.update(time, keys, display);
    let newState = new State(this.level, player, this.status);
    return newState;
}

export default State;