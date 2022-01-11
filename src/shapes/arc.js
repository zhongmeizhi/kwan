import Shape from "./shape";

class Arc extends Shape {
  constructor(args) {
    super(args);
  }

  createPath() {}

  /**
   * @param  {MouseEvent} event
   */
  isPointInPath(event) {
    return true
  }

  renderPath(ctx) {
    ctx.beginPath();
    const { pos, radius, startAngle, endAngle, background, close } = this.attrs;
    const [x, y] = pos;
    if (close) {
      ctx.moveTo(x, y)
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
