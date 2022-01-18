import { PI2, RADIAN } from "../tools/base";
import Shape from "./shape";

class Ring extends Shape {
  constructor(args) {
    super(args);
    this.name = "$$ring";
  }

  createPath() {
    this.paths = [];
    let { pos, innerRadius, outerRadius, startAngle, endAngle } = this.attrs;
    const [x, y] = pos;
    startAngle = RADIAN * startAngle;
    endAngle = RADIAN * endAngle;

    this.paths.push({
      type: "arc",
      args: [x, y, outerRadius, startAngle, endAngle, false],
    });
    if (innerRadius > 0) {
      if (endAngle < startAngle) {
        endAngle = startAngle + PI2 + ((endAngle - startAngle) % PI2);
      }
      if (endAngle - startAngle >= PI2) {
        endAngle = startAngle + PI2 - 1e-6;
      }
      this.paths.push({
        type: "arc",
        args: [x, y, innerRadius, endAngle, startAngle, true],
      });
    }
  }

  /**
   * @param  {MouseEvent} event
   */
  isPointInPath(event) {
    // TODO: 环形边界
    const { offsetX, offsetY } = event;
    const { pos, outerRadius } = this.attrs;
    const [x, y] = pos;
    if (Math.sqrt((x - offsetX) ** 2 + (y - offsetY) ** 2) <= outerRadius) {
      return true;
    }
    return false;
  }
}

export default Ring;
