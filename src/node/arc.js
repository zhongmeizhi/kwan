import { RADIAN } from "../tools/base";
import Node from "./node";

class Arc extends Node {
  constructor(args) {
    super(args);
    this.name = "$$arc";
  }

  /* override */
  createPath() {
    this.paths = [];
    let { pos, radius, startAngle, endAngle, close } = this.attrs;
    const [x, y] = pos;
    startAngle = RADIAN * startAngle;
    endAngle = RADIAN * endAngle;

    const radius2 = radius * 2;
    this.attrs.size = [radius2, radius2];

    this.setOffsetAnchor()
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

  /* override */
  // FIXME: 应该在创建路径时就计算好旋转和偏移
  setOffsetAnchor() {
    const { pos, radius, anchor } = this.attrs;
    const [x, y] = pos;
    let offsetRateX = 0;
    let offsetRateY = 0;
    if (anchor) {
      [offsetRateX, offsetRateY] = anchor;
    }
    this.anchorX = x + radius * offsetRateX;
    this.anchorY = y + radius * offsetRateY;
  }

  /* override */
  /**
   * @param  {MouseEvent} event
   */
  isPointInPath(event) {
    // TODO: 扇形边界
    const { offsetX, offsetY } = event;
    const { pos, radius } = this.attrs;
    const [x, y] = pos;
    if (Math.sqrt((x - offsetX) ** 2 + (y - offsetY) ** 2) <= radius) {
      return true;
    }
    return false;
  }
}

export default Arc;
