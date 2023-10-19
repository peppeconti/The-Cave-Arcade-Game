import audioFiles from "./audio.js";
import { controls, reset } from "./utils.js";

audioFiles.gameOver.addEventListener("ended", () => (controls.gameOver = true));

let State = class State {
  constructor(level, status) {
    this.level = level;
    this.player = level.player;
    this.walls = level.walls;
    this.goal = level.goal;
    this.gate = level.gate;
    this.status = status;
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
      return new State(this.level, "GAME OVER");
    }
    if (this.player.overlap(this.goal, display.viewport)) {
      timer.delay = 3.25;
      timer.intervall = 0;
      audioFiles.closingGate.play();
      return this.level.isLast
        ? new State(this.level, "COMPLETED")
        : new State(this.level, "YOU WON");
    }
  }
  if (this.status === "GAME OVER") {
    this.goal.update(deltaTime);
    this.player.fragments.forEach((e, i) => {
      if (i === 0) e.update(deltaTime, -1, -1);
      if (i === 1) e.update(deltaTime, 1, 1);
      if (i === 2) e.update(deltaTime, -1, 1);
      if (i === 3) e.update(deltaTime, 1, -1);
    });
    if (timer.delay < 0.5 && !controls.gameOver) {
      //audioFiles.space.pause();
      audioFiles.gameOver.play();
    }
  }
  if (this.status === "YOU WON" || this.status === "COMPLETED") {
    this.goal.scale(deltaTime);
    this.level.gate.fragments.forEach((e, i) => {
      if (i === 0) e.update(deltaTime, 1);
      if (i === 1) e.update(deltaTime, -1);
    });
    let distance = this.player.pos
      .subtr(this.goal.pos)
      .add(this.player.size.mult(0.5));
    this.player.pos = this.player.pos.subtr(distance);
  }
  if (keys.Enter && this.status === "START GAME") {
    return new State(this.level, "COUNTDOWN");
  }
  if (this.status === "COUNTDOWN") {
    audioFiles.countdown.play();
    if (timer.delay < 0) return new State(this.level, "PLAYING");
  }
  if (
    keys.Space &&
    timer.delay < 0 &&
    (this.status === "GAME OVER" ||
      this.status === "YOU WON" ||
      this.status === "COMPLETED")
  ) {
    display.canvas.remove();
    reset(audioFiles.gameOver);
    switch (this.status) {
      case "GAME OVER":
        return new State(this.level, "RESTART");
      case "YOU WON":
        return new State(this.level, "NEW LEVEL");
      case "COMPLETED":
        return new State(this.level, "NEW GAME");
      default:
        console.log(`Sorry, we are out of ${this.status}.`);
    }
  }
  let newState = new State(this.level, this.status);
  return newState;
};

export default State;
