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
//const WALLS = [];

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

  unit() {
    if (this.mag() === 0) {
      return new Vector(0, 0);
    } else {
      return new Vector(this.x / this.mag(), this.y / this.mag());
    }
  }

  drawVec(start_x, start_y, n, color, ctx) {
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(start_x + this.x * n, start_y + this.y * n);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.closePath();
  }

  static dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }
};

class Wall {
  constructor(x1, y1, x2, y2) {
    this.start = new Vector(x1, y1);
    this.end = new Vector(x2, y2);
    //WALLS.push(this);
  }

  drawWall(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(this.end.x, this.end.y);
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.closePath();
  }

  wallUnit() {
    return this.end.subtr(this.start).unit();
  }
}

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

Player.prototype.update = function (time, keys) {
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

//returns with the closest point on a line segment to a given point
function closestPointBW(b1, w1) {
  let ballToWallStart = w1.start.subtr(b1.pos.mult(scale));
  if (Vector.dot(w1.wallUnit().mult(scale), ballToWallStart) > 0) {
    return w1.start;
  }

  let wallEndToBall = b1.pos.mult(scale).subtr(w1.end);
  if (Vector.dot(w1.wallUnit().mult(scale), wallEndToBall) > 0) {
    return w1.end;
  }

  let closestDist = Vector.dot(w1.wallUnit(), ballToWallStart);
  let closestVect = w1.wallUnit().mult(closestDist);
  return w1.start.subtr(closestVect);
}

//collision detection between ball and wall
function coll_det_bw(b1, w1) {
  let ballToClosest = closestPointBW(b1, w1).subtr(b1.pos.add(b1.size).mult(scale));
  console.log(ballToClosest.mag());
  if (ballToClosest.mag() <= 2) {
    return true;
  }
}

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
let Wall1 = new Wall(300, 400, 550, 200);
let edge = new Wall(
  canv.canvas.clientWidth,
  0,
  canv.canvas.clientWidth,
  canv.canvas.clientHeight
);

animate((deltaTime) => {
  canv.clearDisplay();
  canv.drawPlayer(level.player);
  Wall1.drawWall(canv.cx);
  closestPointBW(level.player, Wall1)
    .subtr(level.player.pos.mult(scale))
    .drawVec(
      (level.player.pos.x + level.player.size.x) * scale - level.player.size.x*scale/2,
      ((level.player.pos.y + level.player.size.y) * scale - level.player.size.y*scale/2 ),
      1,
      "red",
      canv.cx
    );
  closestPointBW(level.player, edge)
    .subtr(level.player.pos.mult(scale))
    .drawVec(
      (level.player.pos.x + level.player.size.x) * scale - level.player.size.x*scale/2,
      ((level.player.pos.y + level.player.size.y) * scale - level.player.size.y*scale/2 ),
      1,
      "red",
      canv.cx
    );
  level.player.update(deltaTime, arrowKeys);
  //coll_det_bw(level.player, Wall1)
  if (coll_det_bw(level.player, edge)) {
    canv.cx.fillText("collision", 100, 100);
  }
});
