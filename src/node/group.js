import Node from "./node";
import { isNumber, RADIAN } from "../tools/base";

class Group extends Node {
  constructor(args) {
    super(args);
    this.name = "$$group";
    this.children = [];
  }

  /* override */
  createPath() {
    this.paths = [];
    // const { pos, size } = this.attrs;
    // const [x, y] = pos;
    // const [width, height] = size;

    this.setOffsetAnchor();
  }

  /* override */
  // FIXME: 应该在创建路径时就计算好旋转和偏移
  setOffsetAnchor() {
    const { pos, size, anchor } = this.attrs;
    const [x, y] = pos;
    const [width, height] = size;
    let offsetRateX = 0.5;
    let offsetRateY = 0.5;
    if (anchor) {
      [offsetRateX, offsetRateY] = anchor;
    }
    this.anchorX = x + width * offsetRateX;
    this.anchorY = y + height * offsetRateY;
  }

  /* override */
  /**
   * @param  {MouseEvent} event
   */
  isPointInPath(event) {
    const { offsetX, offsetY } = event;
    const { pos, size } = this.attrs;
    const [x, y] = pos;
    const [width, height] = size;
    if (
      offsetX > x &&
      offsetX < x + width &&
      offsetY > y &&
      offsetY < y + height
    ) {
      return true;
    }
    return false;
  }

  append(...shapes) {
    shapes.forEach((shape) => this.children.push(shape));
  }

  /* override */
  buildPath(ctx) {
    const { pos, size, background } = this.attrs;
    const [x, y] = pos;
    const [width, height] = size;

    if (background) {
      ctx.rect(x, y, width, height);
      ctx.fillStyle = background;
      ctx.fill();
    }
    ctx.beginPath();
    // TODO: 矩阵计算， 应该在创建路径时就计算好旋转和偏移
    ctx.translate(x, y);
    this.children.forEach((shape) => {
      shape.draw(ctx);
    });
  }

}

export default Group;
