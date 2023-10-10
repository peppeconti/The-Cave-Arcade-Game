const LEVELS = [
  `
..............||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||..........
..............||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||..........
..............||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||..........
..............|||||||||||||||||||||||!!!!|||||||||||||||||||||||||||||||||||||||||||||||||||..........
..............||||||||||||||||||||||||||||||||||||||||||||||||..................||||||||||||..........
..................||||||||...........||||||.......||..|||||||||....|||||.......|||||...|||||..........
.@................|||||||.................|.......|....|||||||.....|||||||......||||..............+...
..................|...............|................................|||||||..............||||..........
..............|............|........|..........|.....................|||||............||||||..........
..............|........||||||||||||||....|.....|..||||||||||||.......|||||......|.....||||||..........
..............||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||..........
..............||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||..........
..............||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||..........`,
];

let scale = 35;
let end = 1 - (1 / 60) * 59;
let game_over = false;
let game_won = false;
let audio = new Audio("./audio/game_over.mp3");

let Level = class Level {
  constructor(plan) {
    let rows = plan
      .trim()
      .split("\n")
      .map((l) => [...l]);
    this.height = rows.length;
    this.width = rows[0].length;
    this.player;
    this.goal;
    this.rocks = [];

    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        let type = levelMap[ch];
        if (typeof type === "string") return type;
        if (typeof type === "function") {
          if (type.type() === "player") {
            this.player = type.create(new Vector(x, y), 0);
          }
          if (type.type() === "goal") {
            this.goal = type.create(new Vector(x, y));
          }
          if (type.type() === "rock") {
            this.rocks.push(type.create(new Vector(x, y)));
          }
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

class Fragment {
  constructor(pos) {
    this.pos = pos;
    this.vel = 5;
  }

  static create(pos) {
    return new Fragment(pos.add(new Vector(0, 0)));
  }
}

Fragment.prototype.update = function (time, directionX, directionY) {
  this.pos.x += time * directionX * this.vel;
  this.pos.y += time * directionY * this.vel;
};

Fragment.prototype.size = new Vector(0.4, 0.3);

class Goal {
  constructor(pos) {
    this.pos = pos;
    this.translation = 0;
    this.vel = -1;
  }

  static type() {
    return "goal";
  }

  static create(pos) {
    return new Goal(pos.add(new Vector(0.25, 0.25)));
  }
}

Goal.prototype.update = function (time, level) {
  if (this.translation * scale > -(level.width * scale - 700)) {
    this.pos.x = this.pos.x + time * this.vel;
    this.translation += time * this.vel;
  }

  if (overlap(this, level.player)) {
    game_won = true;
    end -= time;
  }
};

Goal.prototype.size = new Vector(0.5, 0.5);

class Rock {
  constructor(pos) {
    this.pos = pos;
    this.translation = 0;
    this.vel = -1;
  }

  static type() {
    return "rock";
  }

  static create(pos) {
    return new Rock(new Vector(pos.x, pos.y));
  }
}

Rock.prototype.update = function (time, level) {
  if (this.translation * scale > -(level.width * scale - 700)) {
    this.pos.x = this.pos.x + time * this.vel;
    this.translation += time * this.vel;
  }

  if (overlap(this, level.player)) {
    if (!game_over) {
      audio.play();
      game_over = !game_over;
    }
    end -= time;
  }

  //this.pos.x = 600/scale;
};

Rock.prototype.size = new Vector(1.02, 1);

class Player {
  constructor(pos) {
    this.pos = pos;
    this.vel = new Vector(0, 0);
    this.acc = new Vector(0, 0);
    this.acceleration = 0.8;
    this.fragments = [];
  }

  static type() {
    return "player";
  }

  static create(pos) {
    let player = new Player(pos.add(new Vector(0, 0.2)));
    player.fragments.push(
      Fragment.create(new Vector(player.pos.x, player.pos.y))
    );
    player.fragments.push(
      Fragment.create(
        new Vector(
          player.pos.x + player.size.x / 2,
          player.pos.y + player.size.y / 2
        )
      )
    );
    player.fragments.push(
      Fragment.create(
        new Vector(player.pos.x, player.pos.y + player.size.y / 2)
      )
    );
    player.fragments.push(
      Fragment.create(
        new Vector(player.pos.x + player.size.x / 2, player.pos.y)
      )
    );
    return player;
  }
}

Player.prototype.size = new Vector(0.8, 0.6);

let friction = 0.1;

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
  this.fragments.forEach((e) => (e.pos = e.pos.add(this.vel)));

  if (this.pos.x < 0) {
    this.pos.x = 0;
    this.fragments.forEach((e, i) => {
      if (i === 0) {
        e.pos.x = 0;
      }
      if (i === 1) {
        e.pos.x = this.size.x / 2;
      }
      if (i === 2) {
        e.pos.x = 0;
      }
      if (i === 3) {
        e.pos.x = 0 + this.size.x / 2;
      }
    });
  }
  if ((this.pos.x + this.size.x) * scale > display.canvas.width) {
    this.pos.x = display.canvas.width / scale - this.size.x;
    this.fragments.forEach((e, i) => {
      if (i === 0) {
        e.pos.x = display.canvas.width / scale - this.size.x;
      }
      if (i === 1) {
        e.pos.x = display.canvas.width / scale - this.size.x / 2;
      }
      if (i === 2) {
        e.pos.x = display.canvas.width / scale - this.size.x;
      }
      if (i === 3) {
        e.pos.x = display.canvas.width / scale - this.size.x / 2;
      }
    });
  }

  if (this.pos.y < 0) {
    this.pos.y = 0;
    this.fragments.forEach((e, i) => {
      if (i === 0) {
        e.pos.y = 0;
      }
      if (i === 1) {
        e.pos.y = this.size.y / 2;
      }
      if (i === 2) {
        e.pos.y = this.size.y / 2;
      }
      if (i === 3) {
        e.pos.y = 0;
      }
    });
  }

  if ((this.pos.y + this.size.y) * scale > display.canvas.height) {
    this.pos.y = display.canvas.height / scale - this.size.y;
    this.fragments.forEach((e, i) => {
      if (i === 0) {
        e.pos.y = display.canvas.height / scale - this.size.y;
      }
      if (i === 1) {
        e.pos.y = display.canvas.height / scale - this.size.y / 2;
      }
      if (i === 2) {
        e.pos.y = display.canvas.height / scale - this.size.y / 2;
      }
      if (i === 3) {
        e.pos.y = display.canvas.height / scale - this.size.y;
      }
    });
  }
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
  "|": Rock,
  "@": Player,
  "+": Goal,
};

class Display {
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

Display.prototype.drawPlayer = function (player) {
  this.cx.fillStyle = "white";
  this.cx.fillRect(
    player.pos.x * scale,
    player.pos.y * scale,
    player.size.x * scale,
    player.size.y * scale
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

Display.prototype.drawRocks = function (rocks) {
  this.cx.fillStyle = "red";

  rocks.forEach((e) => {
    this.cx.fillRect(
      e.pos.x * scale,
      e.pos.y * scale,
      e.size.x * scale,
      e.size.y * scale
    );
  });
};

Display.prototype.drawGoal = function (goal) {
  this.cx.fillStyle = "green";
  this.cx.fillRect(
    goal.pos.x * scale,
    goal.pos.y * scale,
    goal.size.x * scale,
    goal.size.y * scale
  );
};

Display.prototype.clearDisplay = function () {
  this.cx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

let level = new Level(LEVELS[0]);

function overlap(actor1, actor2) {
  return (
    actor1.pos.x + actor1.size.x > actor2.pos.x &&
    actor1.pos.x < actor2.pos.x + actor2.size.x &&
    actor1.pos.y + actor1.size.y > actor2.pos.y &&
    actor1.pos.y < actor2.pos.y + actor2.size.y
  );
}

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

let display = new Display(document.body, level);

//level.rocks.forEach((e) => console.log(e.pos.x * scale));
//console.log(level.player);
//console.log(level.height * scale);
//console.log(level.width * scale);
console.log(level.fragments);

animate((deltaTime) => {
  if (end > 0) {
    display.clearDisplay();
    display.drawRocks(level.rocks);
    display.drawGoal(level.goal);
    display.drawPlayer(level.player);
    level.player.update(deltaTime, arrowKeys, display);
    level.goal.update(deltaTime, level);
    level.rocks.forEach((e) => e.update(deltaTime, level));
    if (end < 0) game_over = true;
  }
  if (end < 0) {
    display.clearDisplay();
    display.drawRocks(level.rocks);
    display.drawGoal(level.goal);
    display.drawFragments(level.player.fragments);
    level.goal.update(deltaTime, level);
    level.rocks.forEach((e) => e.update(deltaTime, level));
    level.player.fragments.forEach((e, i) => {
      if (i === 0) e.update(deltaTime, -1, -1);
      if (i === 1) e.update(deltaTime, 1, 1);
      if (i === 2) e.update(deltaTime, -1, 1);
      if (i === 3) e.update(deltaTime, 1, -1);
    });
  }
  if (game_over) {
    display.cx.fillStyle = "white";
    display.cx.fillText("GAME OVER", 20, 20);
  }
  if (game_won) {
    display.cx.fillStyle = "white";
    display.cx.fillText("YO WON!", 20, 20);
  }
});
