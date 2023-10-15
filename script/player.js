import Vector from "./vector.js";
import { scale } from "./game_levels.js";

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

let Player = class Player {
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
};

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

  let newPos = this.pos;

  return new Player(newPos);
};

Player.prototype.overlap = function (el, viewport) {
  if (el.length) return el.some(
    (actor) =>
      this.pos.x + this.size.x > actor[0] + viewport.left &&
      this.pos.x < actor[0] + viewport.left + 1 &&
      this.pos.y + this.size.y > actor[1] + viewport.top &&
      this.pos.y < actor[1] + viewport.top + 1
  ) 
  else return this.pos.x + this.size.x > el.pos.x &&
      this.pos.x < el.pos.x + el.size.x &&
      this.pos.y + this.size.y > el.pos.y &&
      this.pos.y < el.pos.y + el.size.y
};

export default Player;
