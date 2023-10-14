import { LEVELS } from "./game_levels.js";
import Level from "./level.js";
import State from "./state.js";
import Display from "./display.js";

function trackKeys(keys) {
  let down = Object.create(null);
  function track(event) {
    //console.log(event.key)
    if (keys.includes(event.key)) {
      down[event.key] = event.type == "keydown";
      event.preventDefault();
    }
  }
  window.addEventListener("keydown", track);
  window.addEventListener("keyup", track);
  return down;
}

const arrowKeys = trackKeys([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Enter"
]);

//console.log(new Level(LEVELS[0]).walls)

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
      state = state.update(deltaTime, arrowKeys, display);
      display.syncState(state, deltaTime, level);
      return true;
    });
  });
}

async function runGame(plans) {
  for (let level = 0; level < plans.length; ) {
    let status = await runLevel(new Level(LEVELS[level]));
  }
}

runGame(LEVELS, Display);
