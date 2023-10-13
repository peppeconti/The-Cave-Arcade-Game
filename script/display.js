let scale = 35;

let Display = class Display {
  constructor(parent, level) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = Math.min(700, level.width * scale);
    this.canvas.height = level.height * scale;
    parent.appendChild(this.canvas);
    this.cx = this.canvas.getContext("2d");

    this.viewport = {
      left: 0,
      top: 0,
      width: this.canvas.width / scale,
      height: this.canvas.height / scale,
    };
  }
};

Display.prototype.clearDisplay = function () {
  this.cx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

Display.prototype.syncState = function (state, deltaTime) {
  this.clearDisplay();
  if (state.status === "START GAME") {
    state.intervall += deltaTime;
    if (state.intervall > 1.25) state.intervall = 0;
    if (state.intervall > 0 && state.intervall < 0.75) {
      this.cx.fillStyle = "white";
      this.cx.font = "30px Arial";
      this.cx.textAlign = "center";
      this.cx.fillText(
        "PRESS 'ENTER' TO START",
        this.canvas.width / 2,
        this.canvas.height / 2 + 15
      );
    }
  }
  if (state.status === "PLAYING") {
    if (state.intervall > 0.1) {
      state.intervall -= deltaTime;
      this.cx.beginPath();
      this.cx.arc(
        this.canvas.width / 2,
        this.canvas.height / 2,
        50,
        0,
        2 * Math.PI
      );
      this.cx.fillStyle = "white";
      this.cx.fill();
      this.cx.closePath();
      this.cx.fillStyle = "black";
      this.cx.font = "50px Arial";
      this.cx.textAlign = "center";
      this.cx.fillText(
        Math.ceil(state.intervall),
        this.canvas.width / 2,
        (this.canvas.height / 2) + 18
      );
    } else {
      this.drawRocks(state.rocks);
      this.drawPlayer(state.player);
    }
  }
};

Display.prototype.drawRocks = function (rocks) {
  this.cx.fillStyle = "blue";

  rocks.forEach((e) => {
    this.cx.fillRect(
      e.pos.x * scale,
      e.pos.y * scale,
      e.size.x * scale,
      e.size.y * scale
    );
  });
};

Display.prototype.drawPlayer = function (player) {
  this.cx.fillStyle = "white";
  this.cx.fillRect(
    player.pos.x * scale,
    player.pos.y * scale,
    player.size.x * scale,
    player.size.y * scale
  );
};

export default Display;
