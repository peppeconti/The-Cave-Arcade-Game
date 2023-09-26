const LEVELS = [
  `
..............|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||........
..............|||||||||||||||||||||||!!!!||||||||||||||||||||||||||||||||||||||||||||||||||........
..............|||||||||||||||||||||||||||||...|||.......||||||..................|||||||||||........
..................|||||||||..........|....|........|..|||||||||..|||||||....||||||||...||||........
..@...............|||||||.....||||........|....|..|....|||||||...|||||||||......||||............+..
..................|...............|....|.......|........||||||..||||||||||......||||....||||.......
..............|............|........|....|......|..|.................|||||.........|..||||||.......
..............|........||||||||||||||....|.....|..||||||||||||.......|||||......|.....||||||.......
..............||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||.......`,
];

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
    return new Player(pos.plus(new Vector(0, -0.5)), new Vector(0, 0));
  }
}

Player.prototype.size = new Vector(0.9, 0.7);

const levelMap = {
  ".": "empty",
  "|": "rock",
  "@": Player,
  "+": "goal",
};

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

//animate((deltaTime) => console.log(deltaTime));
