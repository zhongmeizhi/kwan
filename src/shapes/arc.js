import { isNumber, RADIAN } from "../tools/base";
import Shape from "./shape";

class Arc extends Shape {
  constructor(args) {
    super(args);
    this.name = "$$arc";
  }

  createPath() {
    this.paths = [];
    let { pos, radius, startAngle, endAngle, close } = this.attrs;
    const [x, y] = pos;
    startAngle = RADIAN * startAngle;
    endAngle = RADIAN * endAngle;

    if (close) {
      this.paths.push({
        type: "moveTo",
        args: [x, y],
      });
    }
    this.paths.push({
      type: "arc",
      args: [x, y, radius, startAngle, endAngle, false],
    });
  }

  /**
   * @param  {MouseEvent} event
   */
  isPointInPath(event) {
    // TODO: 扇形边界
    const { offsetX, offsetY } = event;
    const { pos, radius } = this.attrs;
    const [x, y] = pos;
    if (
      Math.sqrt(Math.pow(x - offsetX, 2) + Math.pow(y - offsetY, 2)) <= radius
    ) {
      return true;
    }
    return false;
  }

  renderPath(ctx) {
    ctx.beginPath();
    let { pos, rotate, background, opacity } = this.attrs;
    const [x, y] = pos;
    if (isNumber(opacity)) {
      ctx.globalAlpha = opacity;
    }
    if (rotate) {
      ctx.translate(x, y);
      ctx.rotate(rotate * RADIAN);
      ctx.translate(-x, -y);
    }
    this.paths.forEach(({ type, args }) => {
      ctx[type](...args);
    });
    if (background) {
      ctx.fillStyle = background;
      ctx.fill();
    }
    // ctx.closePath();
  }
}

export default Arc;
