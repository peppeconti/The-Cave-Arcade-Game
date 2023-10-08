const LEVELS = [
  `
..............||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||..........
..............||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||..........
..............||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||..........
..............|||||||||||||||||||||||!!!!|||||||||||||||||||||||||||||||||||||||||||||||||||..........
..............|||||||||||||||||||||||||||||||||||.......||||||..................||||||||||||..........
..................|||||||||..........||||||.......||..|||||||||..|||||||....||||||||...|||||..........
.@................|||||||.....||||........|....|..|....|||||||...|||||||||......||||............+.....
..................|...............||...||......|........||||||..||||||||||......||||....||||..........
..............|............|........|....|.....||..|.................|||||.........|..||||||..........
..............|........||||||||||||||....|.....|..||||||||||||.......|||||......|.....||||||..........
..............||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||..........
..............||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||..........
..............||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||..........`,
];

let scale = 35;

let Level = class Level {
  constructor(plan) {
    let rows = plan
      .trim()
      .split("\n")
      .map((l) => [...l]);
    this.height = rows.length;
    this.width = rows[0].length;
    this.player;

    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        let type = levelMap[ch];
        if (typeof type === "string") return type;
        if (typeof type === "function") {
          this.player = type.create(new Vector(x, y), 0);
          return "empty";
        }
      });
    });
  }
};

let Vector = class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }
  subtr(other) {
    return new Vector(this.x - other.x, this.y - other.y);
  }
  mag() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
  mult(factor) {
    return new Vector(this.x * factor, this.y * factor);
  }
};

class Player {
  constructor(pos) {
    this.pos = pos;
    this.vel = new Vector(0, 0);
    this.acc = new Vector(0, 0);
    this.acceleration = 0.75;
  }

  get type() {
    return "player";
  }

  static create(pos) {
    return new Player(pos.add(new Vector(0, 0.25)));
  }
}

Player.prototype.size = new Vector(0.8, 0.5);

let friction = 0.07;

Player.prototype.update = function (time, keys, display) {
  if (keys.ArrowRight) {
    this.acc.x = this.acceleration;
  }
  if (keys.ArrowLeft) {
    this.acc.x = -this.acceleration;
  }
  if (keys.ArrowDown) {
    this.acc.y = this.acceleration;
  }
  if (keys.ArrowUp) {
    this.acc.y = -this.acceleration;
  }
  if (!keys.ArrowRight && !keys.ArrowLeft) {
    this.acc.x = 0;
  }
  if (!keys.ArrowDown && !keys.ArrowUp) {
    this.acc.y = 0;
  }
  this.vel = this.vel.add(this.acc.mult(time));
  this.vel = this.vel.mult(1 - friction);
  this.pos = this.pos.add(this.vel);

  if (this.pos.x < 0) this.pos.x = 0;
  if ((level.player.pos.x + level.player.size.x) * scale > display.canvas.width)
    level.player.pos.x = display.canvas.width / scale - level.player.size.x;

  if (this.pos.y < 0) this.pos.y = 0;

  if ((level.player.pos.y + level.player.size.y) * scale > display.canvas.height)
  level.player.pos.y = display.canvas.height / scale - level.player.size.y

  //this.pos.x = 600/scale;
};

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

const levelMap = {
  ".": "empty",
  "|": "rock",
  "@": Player,
  "+": "goal",
};

class CanvasDisplay {
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

  clear() {
    this.canvas.remove();
  }
}

CanvasDisplay.prototype.drawPlayer = function (player) {
  this.cx.strokeStyle = "white";

  this.cx.fillStyle = "white";

  this.cx.fillRect(
    player.pos.x * scale,
    player.pos.y * scale,
    player.size.x * scale,
    player.size.y * scale
  );
  this.cx.strokeRect(
    player.pos.x * scale,
    player.pos.y * scale,
    player.size.x * scale,
    player.size.y * scale
  );
};

CanvasDisplay.prototype.clearDisplay = function () {
  this.cx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

let level = new Level(LEVELS[0]);

//console.log(level.height * scale);

//console.log(level.player);

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

let display = new CanvasDisplay(document.body, level);

animate((deltaTime) => {
  display.clearDisplay();
  display.drawPlayer(level.player);
  level.player.update(deltaTime, arrowKeys, display);
  //canv.cx.fillText((level.player.pos.x + level.player.size.x) * scale, 20, 20);
});
