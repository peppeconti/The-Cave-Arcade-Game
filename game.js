const LEVELS = [
  `
..............||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||..........
..............|||||||||||||||||||||||!!!!|||||||||||||||||||||||||||||||||||||||||||||||||||..........
..............|||||||||||||||||||||||||||||||||||.......||||||..................||||||||||||..........
..................|||||||||..........||||||.......||..|||||||||..|||||||....||||||||...|||||..........
.@................|||||||.....||||........|....|..|....|||||||...|||||||||......||||............+.....
..................|...............||...||......|........||||||..||||||||||......||||....||||..........
..............|............|........|....|.....||..|.................|||||.........|..||||||..........
..............|........||||||||||||||....|.....|..||||||||||||.......|||||......|.....||||||..........
..............||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||..........`,
];

let scale = 40;

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

Level.prototype.touchesBoard = function (pos, size, canvas) {
  let xStart = Math.floor(pos.x * scale);
  let yStart = Math.floor(pos.y * scale);
  let isOutside = xStart < 0 || xStart + size.x * scale > canvas.viewport.width * scale || yStart < 0 || yStart + size.y *scale > canvas.viewport.height * scale;
  return isOutside;

};

let Vector = class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  plus(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }
  times(factor) {
    return new Vector(this.x * factor, this.y * factor);
  }
};

class Player {
  constructor(pos, speed) {
    this.pos = pos;
    this.speed = speed;
  }

  get type() {
    return "player";
  }

  static create(pos) {
    return new Player(pos.plus(new Vector(0, 0.25)), new Vector(0, 0));
  }
}

Player.prototype.size = new Vector(.8, 0.5);

var playerSpeed = 6;

Player.prototype.update = function (time, level, keys, canvas) {
  let pos = this.pos;
  let xSpeed = 0;
  if (keys.ArrowLeft) xSpeed -= time * playerSpeed;
  if (keys.ArrowRight) xSpeed += time * playerSpeed;
  let movedX = pos.plus(new Vector(xSpeed, 0));

  if (level.touchesBoard(movedX, this.size, canvas)) {
    pos = pos;
  } else pos = movedX;

  let ySpeed = 0;
  if (keys.ArrowUp) ySpeed -= time * playerSpeed;
  if (keys.ArrowDown) ySpeed += time * playerSpeed;
  let movedY = pos.plus(new Vector(0, ySpeed));

  if (level.touchesBoard(movedY, this.size, canvas)) {
    pos = pos;
  } else pos = movedY;

  this.pos = pos;
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
    this.canvas.width = Math.min(600, level.width * scale);
    this.canvas.height = Math.min(450, level.height * scale);
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
  this.cx.fillStyle = "blue";
  this.cx.fillRect(
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

let canv = new CanvasDisplay(document.body, level);

animate((deltaTime) => {
  canv.clearDisplay();
  canv.drawPlayer(level.player);
  level.player.update(deltaTime, level, arrowKeys, canv);
});
