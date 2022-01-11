import EventDispatcher from "../tools/eventDispatcher";
import { errorHandler, isNumber } from "../tools/base";

class Shape extends EventDispatcher {
  constructor(attrs) {
    super();
    // TODO: 入参校验
    this.attrs = attrs;
    this.dirty = false;
    this.createPath();
  }

  setAttrs(newAttrs = {}) {
    // TODO: 入参校验
    this.attrs = Object.assign({}, this.attrs, newAttrs);
    if (newAttrs.pos || newAttrs.size || newAttrs.borderRadius) {
      this.createPath();
    }
    this.dirty = true;
  }
x
  createPath() {
    errorHandler("render 需要被重写");
  }

  isPointInPath() {
    errorHandler("isPointInPath 需要被重写");
  }

  renderPath() {
    errorHandler("renderPath 需要被重写");
  }

  draw(ctx) {
    ctx.save();
    this.renderPath(ctx)
    ctx.restore();
  }
}

export default Shape;
