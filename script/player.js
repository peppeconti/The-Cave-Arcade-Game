import Vector from "./vector.js";
import { scale } from "./game_levels.js";

let Player = class Player {
  constructor(pos) {
    this.pos = pos;
    this.vel = new Vector(0, 0);
    this.acc = new Vector(0, 0);
    this.acceleration = 0.8;
  }

  static type() {
    return "player";
  }

  static create(pos) {
    let player = new Player(pos.add(new Vector(0, 0.2)));
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

  if (this.pos.x < 0) {
    this.pos.x = 0;
  }
  if ((this.pos.x + this.size.x) * scale > display.canvas.width) {
    this.pos.x = display.canvas.width / scale - this.size.x;
  }

  if (this.pos.y < 0) {
    this.pos.y = 0;
  }

  if ((this.pos.y + this.size.y) * scale > display.canvas.height) {
    this.pos.y = display.canvas.height / scale - this.size.y;
  }

  let newPos = this.pos;

  return new Player(newPos);
};

export default Player;
