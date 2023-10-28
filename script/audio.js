import { controls } from "./utils.js";

const audioFiles = {
    'gameOver': new Audio("./audio/lost_game.mp3"),
    'shipDestroy': new Audio("./audio/game_over.mp3"),
    'closingGate': new Audio("./audio/gate.mp3"),
    'space': new Audio("./audio/space.mp3"),
    'countdown': new Audio("./audio/countdown.mp3"),
    'moving': new Audio("./audio/moving.mp3")
}

const audiosArray = Object.keys(audioFiles).map((key) => audioFiles[key]);

const promises = audiosArray.map(audio => {
  return new Promise(response => {
    audio.addEventListener("canplaythrough", () => response(audio));
  });
});

Promise.all(promises).then(() => {
    setTimeout(() => {
        controls.audioLoaded = !controls.audioLoaded;
    }, 7000)
});

export default audioFiles