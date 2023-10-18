import Player from "./player.js";
import Vector from "./vector.js";
import Goal from "./goal.js";
import Gate from "./gate.js";

const levelMap = {
  ".": "empty",
  "□": "wall",
  "|": Gate,
  "+": Goal,
  "@": Player,
};

let Level = class Level {
  constructor(level, plans) {
    let rows = level
      .trim()
      .split("\n")
      .map((l) => [...l]);
    this.height = rows.length;
    this.width = rows[0].length;
    this.player;
    this.goal;
    this.gate;
    this.walls = [];
    this.isLast = plans.indexOf(level) === plans.length - 1;
    this.levelNum = plans.indexOf(level) + 1;

    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        let type = levelMap[ch];
        if (typeof type === "string") {
          if (type === "wall") {
            this.walls.push([x, y]);
            return type;
          }
          return type
        }
        if (typeof type === "function") {
          if (type.type() === "player") {
            this.player = type.create(new Vector(x, y));
          }
          if (type.type() === "goal") {
            this.goal = type.create(new Vector(x, y));
          }
          if (type.type() === "gate") {
            this.gate = type.create(new Vector(x, y));
          }
          return "empty";
        }
      });
    });
  }
};
export default Level;
