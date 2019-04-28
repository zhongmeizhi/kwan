import Animator from "../animator/index";
import EventDispatcher from "../event/eventDispatcher";
import { errorHandler, isNumber, RADIAN } from "../utils/tool";

const _animation = Symbol("_animation");

class Node extends EventDispatcher {
  constructor(attrs) {
    super();
    // TODO: 入参校验
    this.attrs = attrs;
    this.meshes = [];
    this.type == "$$shape";
    this.createPath();
  }

  setAttrs(newAttrs = {}) {
    // TODO: 入参校验
    this.attrs = Object.assign({}, this.attrs, newAttrs);
    this.createPath();
    this.meshes.forEach((mesh) => mesh.setDirty(true));
  }

  getAnimator() {
    return this[_animation];
  }

  // TODO: 入参校验
  animate([startAttrs, endAttrs], options) {
    this[_animation] = new Animator(this, startAttrs, endAttrs, options);
    return this[_animation];
  }

  bindMeshes(mesh) {
    this.meshes.push(mesh);
  }

  // 旋转中心点
  setOffsetAnchor() {
    const [x, y] = this.attrs.pos;
    this.anchorX = x;
    this.anchorY = y;
  }

  // adjustAttr() {
  // }

  createPath() {
    errorHandler("render 需要被重写");
  }

  buildStyle(ctx) {
    const { boxShadow, rotate, opacity } = this.attrs;
    // TODO: 透明度等应该在路径绘制时将颜色算好
    if (isNumber(opacity)) {
      ctx.globalAlpha = opacity;
    }
    // TODO: 矩阵计算， 应该在创建路径时就计算好旋转和偏移
    if (rotate) {
      ctx.translate(this.anchorX, this.anchorY);
      ctx.rotate(rotate * RADIAN);
      ctx.translate(-this.anchorX, -this.anchorY);
    }
    if (boxShadow) {
      const [shadowColor, x, y, blur] = boxShadow;
      ctx.shadowColor = shadowColor;
      ctx.shadowOffsetX = x;
      ctx.shadowOffsetY = y;
      ctx.shadowBlur = blur;
    }
  }

  buildPath(ctx) {
    if (this.paths && this.paths.length) {
      const { background } = this.attrs;
      this.paths.forEach(({ type, args }) => {
        ctx[type](...args);
      });
      if (background) {
        ctx.fillStyle = background;
        ctx.fill();
      }
    }
  }

  isPointInPath() {
    errorHandler("isPointInPath 需要被重写");
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    this.buildStyle(ctx);
    // console.log(this.attrs, 'arc');
    this.buildPath(ctx);
    ctx.restore();
    this.isDirty = false;
  }
}

export default Node;
