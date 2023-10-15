import LEVELS from "./game_levels.js";
import { arrowKeys } from "./utils.js";
import Level from "./level.js";
import State from "./state.js";
import Display from "./display.js";
import { timer } from "./utils.js";

function animate(deltaTimeFunc) {
  let lastTime = 0;
  const frame = (timeStamp) => {
    if (lastTime) {
      let deltaTime = Math.min(timeStamp - lastTime, 100) / 1000;
      if (deltaTimeFunc(deltaTime) === false) return;
    }
    lastTime = timeStamp;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function runLevel(level) {
  let display = new Display(document.body, level);
  let state = new State(level, "START GAME", 0);
  return new Promise((resolve) => {
    animate((deltaTime) => {
      state = state.update(deltaTime, arrowKeys, display, timer);
      display.syncState(state, deltaTime, level, timer);
      return true;
    });
  });
}

function runGame(plan) {
  //for (let level = 0; level < plans.length; ) {
    runLevel(new Level(plan[0]));
  //}
}

runGame(LEVELS, Display);
