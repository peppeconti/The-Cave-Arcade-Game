import { scale } from "./game_levels.js";

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

Display.prototype.syncState = function (state, deltaTime, level) {
  this.clearDisplay();
  if (state.status === "START GAME") {
    state.intervall += deltaTime;
    if (state.intervall > 1.25) state.intervall = 0;
    if (state.intervall > 0 && state.intervall < 0.75) {
      this.drawPress("PRESS 'ENTER' TO START");
    }
    this.cx.fillStyle = "white";
    this.cx.font = "60px 'Wallpoet'";
    this.cx.textAlign = "center";
    this.cx.fillText(
      "THE CAVE",
      this.canvas.width / 2,
      this.canvas.height / 2.5 + 25
    );
    this.cx.font = "15px 'Wallpoet'";
    this.cx.textAlign = "left";
    this.cx.fillText(
      `© Giuseppe Conti ${new Date().getFullYear()}`,
      20,
      this.canvas.height - 20
    );
  }
  if (state.status === "PLAYING") {
    if (state.intervall > 0) {
      this.drawCountDown(state.intervall);
      state.intervall -= deltaTime;
    } else {
      this.updateScreen(deltaTime, level);
      this.drawBackGround(level);
      this.drawPlayer(state.player);
    }
  }
  if (state.status === "GAME OVER") {
    this.updateScreen(deltaTime, level);
    this.drawBackGround(level);
    this.drawFragments(state.player.fragments);
    state.intervall += deltaTime;
    if (state.intervall > 1.25) state.intervall = 0;
    if (state.intervall > 0 && state.intervall < 0.75) {
      this.drawPress("PRESS 'ENTER' TO RESTART");
    }
    this.cx.fillStyle = "white";
    this.cx.font = "60px 'Wallpoet'";
    this.cx.textAlign = "center";
    this.cx.fillText(
      "GAME OVER",
      this.canvas.width / 2,
      this.canvas.height / 2.5 + 25
    );
  }
  if (state.status === "YOU WON") {
    this.updateScreen(deltaTime, level);
    this.drawBackGround(level);
    this.drawPlayer(state.player);
    state.intervall += deltaTime;
    if (state.intervall > 1.25) state.intervall = 0;
    if (state.intervall > 0 && state.intervall < 0.75) {
      this.drawPress("PRESS 'ENTER' TO RESTART");
    }
    this.cx.fillStyle = "white";
    this.cx.font = "60px 'Wallpoet'";
    this.cx.textAlign = "center";
    this.cx.fillText(
      "YOU WON",
      this.canvas.width / 2,
      this.canvas.height / 2.5 + 25
    );
  }
};

Display.prototype.drawPlayer = function (player) {
  this.cx.fillStyle = "white";
  // TOP RIGHT
  this.cx.fillRect(
    (player.pos.x + player.size.x / 2) * scale,
    player.pos.y * scale,
    (player.size.x / 2) * scale,
    (player.size.y / 1.9) * scale
  );
  // TOP LEFT
  this.cx.fillRect(
    player.pos.x * scale,
    player.pos.y * scale,
    (player.size.x / 1.9) * scale,
    (player.size.y / 1.9) * scale
  );
  // BOTTOM LEFT
  this.cx.fillRect(
    player.pos.x * scale,
    (player.pos.y + player.size.y / 2) * scale,
    (player.size.x / 1.9) * scale,
    (player.size.y / 2) * scale
  );
  // BOTTOM RIGHT
  this.cx.fillRect(
    (player.pos.x + player.size.x / 2) * scale,
    (player.pos.y + player.size.y / 2) * scale,
    (player.size.x / 2) * scale,
    (player.size.y / 2) * scale
  );
};

Display.prototype.drawPress = function (text) {
  this.cx.fillStyle = "white";
  this.cx.font = "30px 'Wallpoet'";
  this.cx.textAlign = "center";
  this.cx.fillText(text, this.canvas.width / 2, this.canvas.height / 2 + 45);
};

Display.prototype.drawCountDown = function (intervall) {
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
  this.cx.font = "50px 'Wallpoet'";
  this.cx.textAlign = "center";
  this.cx.fillText(
    Math.ceil(intervall),
    this.canvas.width / 2,
    this.canvas.height / 2 + 15
  );
};

Display.prototype.drawBackGround = function (level) {
  level.walls.forEach((e) => {
    this.cx.fillStyle = "blue";
    this.cx.fillRect(
      (e[0] + this.viewport.left) * scale,
      (e[1] + this.viewport.top) * scale,
      scale,
      scale
    );
  });
    this.cx.fillStyle = "red";
    this.cx.fillRect(
      (level.goal[0][0] + this.viewport.left) * scale + scale/4,
      (level.goal[0][1] + this.viewport.top) * scale + scale/4,
      scale/2,
      scale/2
    );
};

Display.prototype.drawFragments = function (fragments) {
  this.cx.fillStyle = "white";

  fragments.forEach((e) => {
    this.cx.fillRect(
      e.pos.x * scale,
      e.pos.y * scale,
      e.size.x * scale,
      e.size.y * scale
    );
  });
};

Display.prototype.updateScreen = function (time, level) {
  let screen = this.viewport;
  if (screen.left * scale > -(level.width * scale - this.canvas.width)) {
    screen.left -= time * 5;
  }
};

export default Display;
