import { isNumber } from "../tools/base";
import Shape from "./shape";

class Arc extends Shape {
  constructor(args) {
    super(args);
    this.name = "$$arc";
  }

  createPath() {}

  /**
   * @param  {MouseEvent} event
   */
  isPointInPath(event) {
    // TODO: 扇形边界
    return true;
  }

  renderPath(ctx) {
    ctx.beginPath();
    const { pos, radius, startAngle, endAngle, background, opacity, close } =
      this.attrs;
    const [x, y] = pos;
    if (isNumber(opacity)) {
      ctx.globalAlpha = opacity;
    }
    if (close) {
      ctx.moveTo(x, y);
    }
    ctx.arc(x, y, radius, startAngle, endAngle, false);
    if (background) {
      ctx.fillStyle = background;
      ctx.fill();
    }
    // ctx.closePath();
  }
}

export default Arc;
