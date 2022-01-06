import EventDispatcher from "../tools/eventDispatcher";
import { errorHandler, isNumber } from "../tools/base";

class Shape extends EventDispatcher {
  constructor(attrs) {
    super();
    // TODO: 入参校验
    this.attrs = attrs;
    this.paths = [];
    this.dirty = false;
    this.createPath();
  }

  setAttrs(newAttrs = {}) {
    // TODO: 入参校验
    this.attrs = Object.assign({}, this.attrs, newAttrs);
    if (newAttrs.pos || newAttrs.size || newAttrs.borderRadius) {
      this.paths = [];
      this.createPath();
    }
  }

  createPath() {
    errorHandler("render 需要被重写");
  }

  isPointInPath() {
    errorHandler("isPointInPath 需要被重写");
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    const { border, background, boxShadow, opacity } = this.attrs;
    if (isNumber(opacity)) {
      ctx.globalAlpha = opacity;
    }
    if (boxShadow) {
      const [shadowColor, x, y, blur] = boxShadow;
      ctx.shadowColor = shadowColor;
      ctx.shadowOffsetX = x;
      ctx.shadowOffsetY = y;
      ctx.shadowBlur = blur;
    }
    this.paths.forEach(({ type, args }) => {
      ctx[type](...args);
    });
    if (border) {
      // TODO: border up right down left
      const [width, type, color] = border;
      if (width && type && color) {
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
      }
      ctx.stroke();
    }
    if (background) {
      ctx.fillStyle = background;
      ctx.fill();
    }
    ctx.closePath();
    ctx.restore();
  }
}

export default Shape;
