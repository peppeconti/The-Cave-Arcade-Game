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
      deltaTimeFunc(deltaTime);
    }
    lastTime = timeStamp;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function runLevel(level, status, lastLevel) {
  let display = new Display(document.body, level);
  let state = new State(level, status, lastLevel);
  return new Promise((resolve) => {
    animate((deltaTime) => {
      state = state.update(deltaTime, arrowKeys, display, timer);
      display.syncState(state, deltaTime, level, timer);
      if (state.status === "RESTART" || state.status === "NEW LEVEL" || state.status === "NEW GAME") {
        resolve(state.status);
      }
    });
  });
}

async function runGame(plans) {
  let newState = "START GAME";
  for (let level = 0; level < plans.length;) {
    // WAITING FOR PROMISE RESOLVING
    let status = await runLevel(new Level(plans[level], plans), newState);
    // RESETTING TIMER
    timer.delay = 3;
    timer.intervall = 0;
    timer.limit = 0;
    status !== "NEW GAME" ? newState = "COUNTDOWN" : newState = "START GAME";
    // CHECKING STATUS AFTER RESOLVING PROMISE
    if (status === "NEW LEVEL") {
      level++;
    }
    if (status === "NEW GAME") {
      level = 0;
    }
  }
}

runGame(LEVELS);
