const LEVELS = [
  `
..............||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||..........
..............|||||||||||||||||||||||!!!!|||||||||||||||||||||||||||||||||||||||||||||||||||..........
..............|||||||||||||||||||||||||||||||||||.......||||||..................||||||||||||..........
..................|||||||||..........||||||.......||..|||||||||..|||||||....||||||||...|||||..........
..@...............|||||||.....||||........|....|..|....|||||||...|||||||||......||||............+.....
..................|...............||...||......|........||||||..||||||||||......||||....||||..........
..............|............|........|....|.....||..|.................|||||.........|..||||||..........
..............|........||||||||||||||....|.....|..||||||||||||.......|||||......|.....||||||..........
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

/*Level.prototype.touches = function (pos, size, type, viewport) {
  let xStart = Math.floor(pos.x);
  let xEnd = Math.ceil(pos.x + size.x);
  let yStart = Math.floor(pos.y);
  let yEnd = Math.ceil(pos.y + size.y);

  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      let isOutside = x < viewport.left || x + size.x >= viewport.width + viewport.left || y < 0 || y >= viewport.height;
      let here = isOutside ? "rock" : this.rows[y][x];
      if (here === type) return true;
    }
  }
  return false;
};*/

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

Player.prototype.size = new Vector(0.8, 0.5);

var playerSpeed = 7;

Player.prototype.update = function (time, level, keys, viewport) {
  let pos = this.pos;
  let xSpeed = time * 1;
  if (keys.ArrowLeft) xSpeed -= playerSpeed;
  if (keys.ArrowRight) xSpeed += playerSpeed;
  let movedX = pos.plus(new Vector(xSpeed, 0));

  if (level.touches(movedX, this.size, "rock", viewport)) {
    console.log("lost");
  } else if (level.touches(movedX, this.size, "goal", viewport)) {
    console.log("won");
  } else pos = movedX;

  let ySpeed = 0;
  if (keys.ArrowUp) ySpeed -= playerSpeed;
  if (keys.ArrowDown) ySpeed += playerSpeed;
  let movedY = pos.plus(new Vector(0, ySpeed * time));

  if (level.touches(movedY, this.size, "rock", viewport)) {
    console.log("lost");
  } else if (level.touches(movedY, this.size, "goal", viewport)) {
    console.log("won");
  } else pos = movedY;

  return new Player(pos, new Vector(xSpeed, ySpeed));
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

let tiles = document.createElement("img");
tiles.src = "img/tile.png";

CanvasDisplay.prototype.drawBackground = function (level) {
  let { left, top, width, height } = this.viewport;
  let xStart = Math.floor(left);
  let xEnd = Math.ceil(left + width);
  let yStart = Math.floor(top);
  let yEnd = Math.ceil(top + height);

  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      let tile = level.rows[y][x];
      if (tile == "empty") continue;
      let screenX = (x - left) * scale;
      let screenY = (y - top) * scale;
      let tileX = tile == "goal" ? scale : 0;
      this.cx.drawImage(
        tiles,
        tileX,
        0,
        scale,
        scale,
        screenX,
        screenY,
        scale,
        scale
      );
    }
  }
};

CanvasDisplay.prototype.drawPlayer = function (player) {
  this.cx.fillStyle = "blue";
  this.cx.fillRect(
    (player.pos.x - this.viewport.left) * scale,
    (player.pos.y - this.viewport.top) * scale,
    player.size.x * scale,
    player.size.y * scale
  );
};

CanvasDisplay.prototype.clearDisplay = function () {
  this.cx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

CanvasDisplay.prototype.updateViewport = function (time, level) {
  let view = this.viewport;
  let speed = 1;

  if (view.left < level.width - this.canvas.width / scale) {
    view.left += time * speed;
  } else {
    view.left = level.width - this.canvas.width / scale;
  }
};

let level = new Level(LEVELS[0]);

console.log(level.player);

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

//console.log(canv);

animate((deltaTime) => {
  canv.clearDisplay();
  canv.drawBackground(level);
  canv.drawPlayer(level.player);
  canv.updateViewport(deltaTime, level);
  level.player = level.player.update(deltaTime, level, arrowKeys, canv.viewport);
});
