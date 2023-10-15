import Vector from "./vector.js";

let Goal = class Goal {
  constructor(pos, wobble) {
    this.pos = pos;
    this.wobble = wobble;
  }

  static type() {
    return "goal";
  }

  static create(pos) {
    return new Goal(pos.add(new Vector(0.25, 0.25)), Math.PI * 2);
  }
};

const wobbleSpeed = 8, wobbleDist = .07;

Goal.prototype.update = function (deltaTime) {
  let wobble = this.wobble + deltaTime + wobbleSpeed;
  let wobblePos = Math.sin(wobble) * wobbleDist;
  return new Goal(this.pos.add(new Vector(0, wobblePos)), wobble)
};

Goal.prototype.size = new Vector(0.5, 0.5);

export default Goal;
