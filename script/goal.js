import Vector from "./vector.js";

let Goal = class Goal {
  constructor(pos) {
    this.pos = pos;
    this.angle = 0;
  }

  static type() {
    return "goal";
  }

  static create(pos) {
    return new Goal(pos.add(new Vector(0.5, 0.5)));
  }
};

Goal.prototype.update = function (deltaTime) {
  this.angle += deltaTime;
};

Goal.prototype.scale = function() {
  while (this.size.x != 0 && this.size.y != 0) {
    this.size.x -= .01;
    this.size.y -= .01;
  }

}

Goal.prototype.size = new Vector(.4, .4);

export default Goal;
