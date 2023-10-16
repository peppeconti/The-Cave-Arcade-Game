import audioFiles from "./audio.js";

let State = class State {
  constructor(level, status, lastLevel) {
    this.level = level;
    this.player = level.player;
    this.walls = level.walls;
    this.goal = level.goal;
    this.gate =level.gate;
    this.status = status;
    this.lastLevel = lastLevel;
  }
};

State.prototype.update = function (deltaTime, keys, display, timer) {
  if (this.status === "PLAYING" && timer.delay < 0) {
    //audioFiles.space.play();
    this.player.update(deltaTime, keys, display);
    this.goal.update(deltaTime);
    if (this.player.overlap(this.walls, display.viewport)) {
      audioFiles.shipDestroy.play();
      timer.delay = 2.5;
      timer.intervall = 0;
      return new State(this.level, "GAME OVER", this.lastLevel);
    };
    if (this.player.overlap(this.goal, display.viewport)) {
      timer.delay = 3.25;
      timer.intervall = 0;
      //audioFiles.closingGate.play();
      return this.lastLevel ? new State(this.level, "COMPLETED", this.lastLevel) : new State(this.level, "YOU WON", this.lastLevel)
    };
  }
  let newState = new State(this.level, this.status, this.lastLevel);
  if (this.status === "GAME OVER") {
    this.goal.update(deltaTime);
    this.level.player.fragments.forEach((e, i) => {
      if (i === 0) e.update(deltaTime, -1, -1);
      if (i === 1) e.update(deltaTime, 1, 1);
      if (i === 2) e.update(deltaTime, -1, 1);
      if (i === 3) e.update(deltaTime, 1, -1);
    });
    /*if(timer.delay < 0) {
      audioFiles.space.pause();
      audioFiles.gameOver.play();
    }*/
  }
  if (this.status === "YOU WON") {
    this.level.gate.fragments.forEach((e, i) => {
      if (i === 0) e.update(deltaTime, 1, this.level.gate, timer);
      if (i === 1) e.update(deltaTime, -1, this.level.gate, timer);
    });
  }
  if (keys.Enter && this.status === "START GAME") {
    return new State(this.level, "COUNTDOWN", this.lastLevel);
  }
  if (this.status === "COUNTDOWN") {
    //audioFiles.countdown.play();
    if (timer.delay < 0) return new State(this.level, "PLAYING", this.lastLevel);
  }
  if (keys.Enter && this.status === "GAME OVER") {
    display.canvas.remove();
    return new State(this.level, "RESTART", this.lastLevel);
  }
  if (keys.Enter && this.status === "YOU WON") {
    display.canvas.remove();
    return new State(this.level, "NEW LEVEL", this.lastLevel);
  }
  if (keys.Enter && this.status === "COMPLETED") {
    display.canvas.remove();
    return new State(this.level, "NEW GAME", this.lastLevel);
  }
  return newState;
};

export default State;
