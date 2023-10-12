let Display = class Display {
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
  }

  export default Display;