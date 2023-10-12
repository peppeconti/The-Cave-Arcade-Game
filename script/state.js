let State = class State {
    constructor(level, status) {
        this.level = level;
        this.player = level.player;
        //this.rocks = rocks;
        //this.goal = goal;
        this.status = status;
    } 
}

export default State;