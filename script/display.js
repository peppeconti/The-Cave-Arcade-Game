import { scale } from "./utils.js";

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

Display.prototype.syncState = function (state, deltaTime, level, timer) {
  this.clearDisplay();
  if (state.status === "START GAME") {
    timer.intervall += deltaTime;
    if (timer.intervall > 1.25) timer.intervall = 0;
    if (timer.intervall > 0 && timer.intervall < 0.75) {
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
    if (timer.delay > 0) {
      this.drawCountDown(timer);
      timer.delay -= deltaTime;
    } else {
      this.updateScreen(deltaTime, level);
      this.drawGate(state.gate.fragments);
      this.drawBackGround(level);
      this.drawGoal(state.goal);
      this.drawPlayer(state.player);
    }
  }
  if (state.status === "GAME OVER") {
    this.updateScreen(deltaTime, level);
    this.drawGate(state.gate.fragments);
    this.drawBackGround(level);
    this.drawGoal(state.goal);
    this.drawFragments(state.player.fragments);
    timer.delay -= deltaTime;
    if (timer.delay < 0) {
      timer.intervall += deltaTime;
      if (timer.intervall > 1.25) timer.intervall = 0;
      if (timer.intervall > 0 && timer.intervall < 0.75) {
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
  }
  if (state.status === "YOU WON") {
    this.updateScreen(deltaTime, level);
    this.drawGate(state.gate.fragments);
    this.drawBackGround(level);
    this.drawPlayer(state.player);
    timer.delay -= deltaTime;
    if (timer.delay < 0) {
      timer.intervall += deltaTime;
      if (timer.intervall > 1.25) timer.intervall = 0;
      if (timer.intervall > 0 && timer.intervall < 0.75) {
        this.drawPress("PRESS 'ENTER' TO RESTART");
      }
      this.cx.fillStyle = "white";
      this.cx.font = "60px 'Wallpoet'";
      this.cx.textAlign = "center";
      this.cx.fillText(
        "YOU WON!",
        this.canvas.width / 2,
        this.canvas.height / 2.5 + 25
      );
    }
  }
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

Display.prototype.drawGoal = function (goal) {
  this.cx.save();
  this.cx.translate(goal.pos.x * scale, goal.pos.y * scale);
  this.cx.rotate(goal.angle);
  this.cx.fillStyle = "red";
  this.cx.beginPath();
  this.cx.rect(
    -(goal.size.x * scale) / 2,
    -(goal.size.y * scale) / 2,
    goal.size.x * scale,
    goal.size.y * scale
  );
  this.cx.fill();
  this.cx.closePath();
  this.cx.restore();
};

Display.prototype.drawPress = function (text) {
  this.cx.fillStyle = "white";
  this.cx.font = "30px 'Wallpoet'";
  this.cx.textAlign = "center";
  this.cx.fillText(text, this.canvas.width / 2, this.canvas.height / 2 + 45);
};

Display.prototype.drawCountDown = function (timer) {
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
    Math.ceil(timer.delay),
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
};

Display.prototype.drawGate = function (fragments) {
  this.cx.fillStyle = "grey";

  fragments.forEach((e) => {
    this.cx.fillRect(
      e.pos.x * scale,
      e.pos.y * scale,
      e.size.x * scale,
      e.size.y * scale
    );
  });
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
  let vel = 1;
  let screen = this.viewport;
  let goal = level.goal;
  let gateFragments = level.gate.fragments;
  if (screen.left * scale > -(level.width * scale - this.canvas.width)) {
    screen.left -= time * vel;
    goal.pos.x -= time * vel;
    gateFragments.forEach(e => e.pos.x -= time * vel)
  }
};

export default Display;
