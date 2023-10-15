import Vector from "./vector.js";

let Goal = class Goal {
  constructor(pos, basePos, wobble) {
    this.pos = pos;
    this.basePos = basePos;
    this.wobble = wobble;
  }

  static type() {
    return "goal";
  }

  static create(pos) {
    let basePos = pos.add(new Vector(0.2, 0.1));
    return new Goal(pos.add(basePos, basePos, Math.PI * 2));
  }
};

const wobbleSpeed = 8, wobbleDist = .07;

Goal.prototype.update = function (deltaTime) {
  let wobble = this.wobble + deltaTime + wobbleSpeed;
  let wobblePos = Math.sin(wobble) * wobbleDist;
  return new Goal(this.pos.add(new Vector(0, wobblePos)), this.basePos, wobble)
};

Goal.prototype.size = new Vector(0.6, 0.6);

export default Goal;
