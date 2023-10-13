import Vector from "./vector.js";

let scale = 35;

let Rock = class Rock {
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
  };
  
  Rock.prototype.size = new Vector(1.02, 1);

  export default Rock;