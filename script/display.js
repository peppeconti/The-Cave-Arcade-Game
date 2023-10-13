let scale = 35;

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

  Display.prototype.clearDisplay = function () {
    this.cx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  Display.prototype.syncState = function(state) {
    if (state.status === "START GAME") {
      this.cx.fillStyle = "white";
      this.cx.font = "60px Arial";
      this.cx.textAlign = "center";
      this.cx.fillText(state.status, this.canvas.width/2, this.canvas.height/2 + 30);
    }
    if (state.status === "PLAYING") {
      this.clearDisplay();
      this.drawPlayer(state.player);
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

  export default Display;