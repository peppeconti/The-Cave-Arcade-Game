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

  export default Vector;