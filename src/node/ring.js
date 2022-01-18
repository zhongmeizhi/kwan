import Node from "./node";
import { PI2, RADIAN } from "../tools/base";

class Ring extends Node {
  constructor(args) {
    super(args);
    this.name = "$$ring";
  }

  /* override */
  createPath() {
    this.paths = [];
    let { pos, innerRadius, outerRadius, startAngle, endAngle } = this.attrs;
    const [x, y] = pos;
    startAngle = RADIAN * startAngle;
    endAngle = RADIAN * endAngle;

    const radius2 = outerRadius * 2
    this.attrs.size = [radius2, radius2]

    this.setOffsetAnchor()
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

  /* override */
  // FIXME: 应该在创建路径时就计算好旋转和偏移
  setOffsetAnchor() {
    const {pos, outerRadius, anchor} = this.attrs;
    const [x, y] = pos;
    let offsetRateX = 0;
    let offsetRateY = 0;
    if (anchor) {
      [offsetRateX, offsetRateY] = anchor;
    }
    this.anchorX = x + outerRadius * offsetRateX;
    this.anchorY = y + outerRadius * offsetRateY;
  }

  /* override */
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
