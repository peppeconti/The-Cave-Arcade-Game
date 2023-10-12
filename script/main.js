import LEVELS from "./game_levels.js";
import Level from "./level.js";
import State from "./state.js";
import Display from "./display.js";


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

function runLevel(level, Display) {
    let display = new Display(document.body, level);
    let state = new State(level, "START GAME");
    return new Promise(resolve => {
      animate((deltaTime) => {
          
      });
    })
}