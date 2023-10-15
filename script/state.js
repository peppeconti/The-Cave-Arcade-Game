import audioFiles from "./audio.js";

let State = class State {
  constructor(level, status, intervall) {
    this.level = level;
    this.player = level.player;
    this.walls = level.walls;
    this.goal = level.goal;
    this.status = status;
    this.intervall = intervall;
  }
};

State.prototype.update = function (deltaTime, keys, display) {
  if (this.status === "PLAYING" && this.intervall < 0) {
    this.player.update(deltaTime, keys, display);
    this.goal.update(deltaTime);
    if (this.player.overlap(this.walls, display.viewport)) {
      audioFiles.shipDestroy.play();
      return new State(this.level, "GAME OVER", 0);
    };
    if (this.player.overlap(this.goal, display.viewport)) {
      return new State(this.level, "YOU WON", 0);
    };
  }
  let newState = new State(this.level, this.status, this.intervall);
  if (this.status === "GAME OVER") {
    this.level.player.fragments.forEach((e, i) => {
      if (i === 0) e.update(deltaTime, -1, -1);
      if (i === 1) e.update(deltaTime, 1, 1);
      if (i === 2) e.update(deltaTime, -1, 1);
      if (i === 3) e.update(deltaTime, 1, -1);
    });
  }
  if (keys.Enter && this.status === "START GAME") {
    return new State(this.level, "PLAYING", 3);
  }
  return newState;
};

export default State;
