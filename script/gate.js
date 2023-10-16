import Vector from "./vector.js";

class Fragment {
  constructor(pos) {
    this.pos = pos;
    this.vel = .18;
  }

  static create(pos) {
    return new Fragment(pos);
  }
}

let translation = .45

Fragment.prototype.update = function (time, directionY, gate, timer) {
    const fragmentsNum = gate.fragments.length;
    if (timer.limit < translation*fragmentsNum) {
        timer.limit += time * this.vel;
        this.pos.y += time * directionY * this.vel;
    }
};

Fragment.prototype.size = new Vector(.6, .5);

let Gate = class Gate {
  constructor(pos) {
    this.pos = pos;
    this.fragments = [];
  }

  static type() {
    return "gate";
  }

  static create(pos) {
    let gate = new Gate(pos.add(new Vector(0.2, 0)));
    gate.fragments.push(Fragment.create(new Vector(gate.pos.x, gate.pos.y-translation)));
    gate.fragments.push(Fragment.create(new Vector(gate.pos.x, gate.pos.y + gate.size.y/2 + translation)));
    return gate;
  }
};

Gate.prototype.update = function (deltaTime) {};

Gate.prototype.size = new Vector(0.6, 1);

export default Gate;
