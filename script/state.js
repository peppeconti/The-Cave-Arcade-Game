let State = class State {
  constructor(level, status, intervall) {
    this.level = level;
    this.player = level.player;
    this.rocks = level.rocks;
    //this.goal = goal;
    this.status = status;
    this.intervall = intervall;
  }
};

State.prototype.update = function (time, keys, display) {
  if (this.status === "PLAYING" && this.intervall < 0) this.player.update(time, keys, display);
  let newState = new State(this.level, this.status, this.intervall);
  if (keys.Enter && this.status === "START GAME") {
    newState = new State(this.level, "PLAYING", 3);
  }
  return newState;
};

export default State;
