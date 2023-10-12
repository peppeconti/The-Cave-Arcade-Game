import Player from "./player.js";
import Vector from "./vector.js";

const levelMap = {
  ".": "empty",
  "@": Player,
};

let Level = class Level {
  constructor(plan) {
    let rows = plan
      .trim()
      .split("\n")
      .map((l) => [...l]);
    this.height = rows.length;
    this.width = rows[0].length;
    this.player;
    this.goal;
    this.rocks = [];

    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        let type = levelMap[ch];
        if (typeof type === "string") return type;
        if (typeof type === "function") {
          if (type.type() === "player") {
            this.player = type.create(new Vector(x, y), 0);
          }
          if (type.type() === "goal") {
            this.goal = type.create(new Vector(x, y));
          }
          if (type.type() === "rock") {
            this.rocks.push(type.create(new Vector(x, y)));
          }
          return "empty";
        }
      });
    });
  }
};
export default Level;
