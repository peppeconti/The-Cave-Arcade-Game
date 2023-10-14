import Player from "./player.js";
import Vector from "./vector.js";

const levelMap = {
  ".": "empty",
  "|": "wall",
  "+": "goal",
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
    this.walls = [];
    this.goal = [];

    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        let type = levelMap[ch];
        if (typeof type === "string") {
          if (type === "wall") {
            this.walls.push([x, y]);
            return type;
          }
          if (type === "goal") {
            this.goal.push([x, y]);
            return type;
          }
          return type
        }
        if (typeof type === "function") {
          if (type.type() === "player") {
            this.player = type.create(new Vector(x, y), 0);
          }
          return "empty";
        }
      });
    });
  }
};
export default Level;
