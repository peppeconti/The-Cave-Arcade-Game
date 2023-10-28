const timer = {
  delay: 3,
  intervall: 0,
};

const controls = {
  gameOver: false,
  audioLoaded: false
};

const scale = 35;

function trackKeys(keys) {
  let down = Object.create(null);
  function track(event) {
    if (keys.includes(event.code)) {
      down[event.code] = event.type == "keydown";
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
  "Enter",
  "Space",
]);

function reset(audio) {
  audio.pause();
  audio.currentTime = 0;
}

export { timer, controls, scale, arrowKeys, reset };
