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
    this.renderPath(ctx)
    ctx.closePath();
    ctx.restore();
  }
}

export default Shape;
