import audioFiles from "./audio.js";

let State = class State {
  constructor(level, status, intervall) {
    this.level = level;
    this.player = level.player;
    this.walls = level.walls;
    this.goal = level.goal;
    this.status = status;
    //this.intervall = intervall;
  }
};

State.prototype.update = function (deltaTime, keys, display, timer) {
  if (this.status === "PLAYING" && timer.delay < 0) {
    this.player.update(deltaTime, keys, display);
    this.goal.update(deltaTime);
    if (this.player.overlap(this.walls, display.viewport)) {
      audioFiles.shipDestroy.play();
      timer.delay = 2;
      timer.intervall = 0;
      return new State(this.level, "GAME OVER");
    };
    if (this.player.overlap(this.goal, display.viewport)) {
      timer.delay = 5;
      timer.intervall = 0;
      return new State(this.level, "YOU WON");
    };
  }
  let newState = new State(this.level, this.status);
  if (this.status === "GAME OVER") {
    this.goal.update(deltaTime);
    this.level.player.fragments.forEach((e, i) => {
      if (i === 0) e.update(deltaTime, -1, -1);
      if (i === 1) e.update(deltaTime, 1, 1);
      if (i === 2) e.update(deltaTime, -1, 1);
      if (i === 3) e.update(deltaTime, 1, -1);
    });
  }
  if (keys.Enter && this.status === "START GAME") {
    timer.delay = 3;
    return new State(this.level, "PLAYING");
  }
  return newState;
};

export default State;
