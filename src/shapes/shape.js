import EventDispatcher from "../tools/eventDispatcher";
import { errorHandler, isNumber, RADIAN } from "../tools/base";

class Shape extends EventDispatcher {
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
    if (newAttrs.pos || newAttrs.size || newAttrs.borderRadius) {
      this.createPath();
    }
    this.meshes.forEach((mesh) => mesh.setDirty(true));
  }

  bindMeshes(mesh) {
    this.meshes.push(mesh);
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
    const { pos, background, boxShadow, rotate, opacity } = this.attrs;
    const [x, y] = pos;
    if (isNumber(opacity)) {
      ctx.globalAlpha = opacity;
    }
    if (rotate) {
      ctx.translate(x, y);
      ctx.rotate(rotate * RADIAN);
      ctx.translate(-x, -y);
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
    ctx.closePath();
    if (background) {
      ctx.fillStyle = background;
      ctx.fill();
    }
    ctx.restore();
    this.isDirty = false;
  }
}

export default Shape;
