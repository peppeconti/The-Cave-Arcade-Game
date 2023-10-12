import LEVELS from "./game_levels.js";
import Level from "./level.js";

let level = new Level(LEVELS[0]);

console.log(level);

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

function runLevel(display, level) {
    let display = new Display(document.body, level);
    let state = new State(level, "START GAME")
}

animate((deltaTime) => {
    
});