import LEVELS from "./game_levels.js";
import Level from "./level.js";
import State from "./state.js";
import DOMDisplay from "./display.js";


function trackKeys(keys) {
  let down = Object.create(null);
  function track(event) {
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
]);

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
    let display = new DOMDisplay(document.body, level);
    let state = new State(level, "START GAME");
    return new Promise(resolve => {
      animate((deltaTime) => {
          state.update(deltaTime, arrowKeys);
          display.syncState(state);
          return true;
      });
    })
}


async function runGame(plans) {
  for (let level = 0; level < plans.length;) {
    let status = await runLevel(new Level(LEVELS[level]));
  }
}

runGame(LEVELS, DOMDisplay)