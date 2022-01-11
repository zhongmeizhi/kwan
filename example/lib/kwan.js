function isNumber(v) {
  return typeof v === "number";
}
const isArr = Array.isArray;
function isFn$1(fn) {
  return typeof fn === "function";
}
function errorHandler$1(msg) {
  throw new Error(msg);
}
const EVENT_SET = new Set(["click", "mousemove", "mouseenter", "mouseleave"]);

class Loop {
  constructor(run) {
    this.run = run;
    this._running = false;
    this.requestAnimationFrame = this._getRaf();
  }

  start() {
    this._running = true;

    this._runRaf();
  }

  stop() {
    this._running = false;
  }

  _runRaf() {
    const loops = () => {
      this.run();
      this._running && this.requestAnimationFrame(loops);
    };

    this.requestAnimationFrame(loops);
  }

  _getRaf() {
    return typeof window !== "undefined" && (window.requestAnimationFrame && window.requestAnimationFrame.bind(window) || window.msRequestAnimationFrame && window.msRequestAnimationFrame.bind(window) || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame) || function (func) {
      return setTimeout(func, 16);
    };
  }

}

class Scene {
  constructor(target, {
    width,
    height,
    hd = true
  }) {
    if (!target || !(target instanceof HTMLElement)) {
      throw new Error("不能找到匹配的 DOM 元素");
    }

    const ele = document.createElement("canvas");
    this.ctx = ele.getContext("2d");
    this.width = width;
    this.height = height;
    this.shapes = [];

    this._initBox(ele, hd);

    this._initEvent(ele);

    target.appendChild(ele);
  }

  _initBox(ele, hd) {
    if (hd) {
      const dpr = window.devicePixelRatio;
      ele.style.width = this.width + "px";
      ele.style.height = this.height + "px";
      ele.width = this.width * dpr;
      ele.height = this.height * dpr;
      this.ctx.scale(dpr, dpr);
      this.ctx.save();
    } else {
      ele.width = this.width;
      ele.height = this.height;
    }
  }

  _initEvent(ele) {
    this.hoverShapeSet = new Set();
    ele.addEventListener("click", this.onClick.bind(this));
    ele.addEventListener("mousemove", this.onMouseMove.bind(this));
  }

  _traverseShapes(callback) {
    const len = this.shapes.length;

    for (let i = 0; i < len; i++) {
      const shape = this.shapes[i];
      isFn$1(callback) && callback(shape);
    }
  }

  append(shape) {
    if (!this.loop) {
      this.loop = new Loop(this.update.bind(this));
      this.loop.start();
    }

    this.shapes.push(shape);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  update() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this._traverseShapes(shape => shape.draw(this.ctx));
  }

  onClick(event) {
    this._traverseShapes(shape => {
      if (shape.events["click"] && shape.isPointInPath(event)) {
        shape.dispatchEvent("click");
      }
    });
  }

  onMouseMove(event) {
    this._traverseShapes(shape => {

      if (shape.events["mousemove"] || shape.events["mouseenter"] || shape.events["mouseleave"]) {
        if (shape.isPointInPath(event)) {
          if (!this.hoverShapeSet.has(shape)) {
            shape.dispatchEvent("mouseenter");
          }

          shape.dispatchEvent("mousemove");
          this.hoverShapeSet.add(shape);
        } else if (this.hoverShapeSet.has(shape)) {
          shape.dispatchEvent("mouseleave");
          this.hoverShapeSet.delete(shape);
        }
      }
    });
  }

}

function isFn(fn) {
  return typeof fn === "function";
}
function errorHandler(msg) {
  throw new Error(msg);
}

class EventDispatcher {
  constructor() {
    this.events = {};
  }
  /**
   * @param  {String} type
   * @param  {Function} listener
   */


  addEventListener(type, listener) {
    if (!isFn(listener)) return errorHandler("监听对象不是一个函数");
    if (!EVENT_SET.has(type)) return;

    if (!this.events[type]) {
      this.events[type] = new Set();
    }

    this.events[type].add(listener);
  }
  /**
   * @param  {String type
   */


  dispatchEvent(type, argv) {
    if (this.events[type]) {
      this.events[type].forEach(listener => listener.call(this, argv));
    }
  }
  /**
   * @param  {String} type
   * @param  {Function} listener
   */


  removeEventListener(type, listener) {
    if (!this.events[type]) return;

    if (this.events[type] && listener) {
      if (this.events[type].size === 1) {
        delete this.events[type];
      } else {
        this.events[type].delete(listener);
      }
    } else {
      // remove all
      delete this.events[type];
    }
  }

}

class Shape extends EventDispatcher {
  constructor(attrs) {
    super(); // TODO: 入参校验

    this.attrs = attrs; // this.dirty = false;

    this.createPath();
  }

  setAttrs(newAttrs = {}) {
    // TODO: 入参校验
    this.attrs = Object.assign({}, this.attrs, newAttrs);

    if (newAttrs.pos || newAttrs.size || newAttrs.borderRadius) {
      this.createPath();
    }
  }

  createPath() {
    errorHandler$1("render 需要被重写");
  }

  isPointInPath() {
    errorHandler$1("isPointInPath 需要被重写");
  }

  renderPath() {
    errorHandler$1("renderPath 需要被重写");
  }

  draw(ctx) {
    ctx.save();
    this.renderPath(ctx);
    ctx.restore();
  }

}

class Rect extends Shape {
  constructor(args) {
    super(args);
  }

  createPath() {
    this.paths = [];
    const {
      pos,
      size,
      borderRadius
    } = this.attrs;
    const [x, y] = pos;
    const [width, height] = size;
    const radius = borderRadius || 0;

    if (!radius) {
      this.paths.push({
        type: "rect",
        args: [x, y, width, height]
      });
    } else {
      this._buildPath(x, y, width, height, radius);
    }
  }
  /**
   * @param  {MouseEvent} event
   */


  isPointInPath(event) {
    const {
      offsetX,
      offsetY
    } = event;
    const {
      pos,
      border,
      size
    } = this.attrs; // TODO: border
    // const [width] = border;

    const [x, y] = pos;
    const [width, height] = size;

    if (offsetX > x && offsetX < x + width && offsetY > y && offsetY < y + height) {
      return true;
    }

    return false;
  }

  renderPath(ctx) {
    ctx.beginPath();
    const {
      border,
      background,
      boxShadow,
      opacity
    } = this.attrs;

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

    this.paths.forEach(({
      type,
      args
    }) => {
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
    } // ctx.closePath();

  }

  _transformRadius(r, width, height) {
    var r1;
    var r2;
    var r3;
    var r4; // 支持形式的 radius 入参

    if (isNumber(r)) {
      r1 = r2 = r3 = r4 = r;
    } else if (isArr(r)) {
      if (r.length === 1) {
        r1 = r2 = r3 = r4 = r[0];
      } else if (r.length === 2) {
        r1 = r3 = r[0];
        r2 = r4 = r[1];
      } else if (r.length === 3) {
        r1 = r[0];
        r2 = r4 = r[1];
        r3 = r[2];
      } else {
        r1 = r[0];
        r2 = r[1];
        r3 = r[2];
        r4 = r[3];
      }
    } else {
      r1 = r2 = r3 = r4 = 0;
    } // 边界值矫正


    var total;

    if (r1 + r2 > width) {
      total = r1 + r2;
      r1 *= width / total;
      r2 *= width / total;
    }

    if (r3 + r4 > width) {
      total = r3 + r4;
      r3 *= width / total;
      r4 *= width / total;
    }

    if (r2 + r3 > height) {
      total = r2 + r3;
      r2 *= height / total;
      r3 *= height / total;
    }

    if (r1 + r4 > height) {
      total = r1 + r4;
      r1 *= height / total;
      r4 *= height / total;
    }

    return [r1, r2, r3, r4];
  }

  _buildPath(x, y, width, height, r) {
    if (width < 0) {
      x = x + width;
      width = -width;
    }

    if (height < 0) {
      y = y + height;
      height = -height;
    }

    const [r1, r2, r3, r4] = this._transformRadius(r, width, height);

    this.paths.push({
      type: "moveTo",
      args: [x + r1, y]
    });
    this.paths.push({
      type: "arcTo",
      args: [x + width, y, x + width, y + r2, r2]
    });
    this.paths.push({
      type: "arcTo",
      args: [x + width, y + height, x + width - r3, y + height, r3]
    });
    this.paths.push({
      type: "arcTo",
      args: [x, y + height, x, y + height - r4, r4]
    });
    this.paths.push({
      type: "arcTo",
      args: [x, y, x + r1, y, r1]
    }); // TODO: 需要 benchmark 2中绘制方法性能差异
    // this.paths.push({
    //   type: "moveTo",
    //   args: [x + r1, y],
    // });
    // this.paths.push({
    //   type: "lineTo",
    //   args: [x + width - r2, y],
    // });
    // r2 !== 0 && this.paths.push({
    //   type: "arc",
    //   args: [x + width - r2, y + r2, r2, -Math.PI / 2, 0],
    // });
    // this.paths.push({
    //   type: "lineTo",
    //   args: [x + width, y + height - r3],
    // });
    // r3 !== 0 && this.paths.push({
    //   type: "arc",
    //   args: [x + width - r3, y + height - r3, r3, 0, Math.PI / 2],
    // });
    // this.paths.push({
    //   type: "lineTo",
    //   args: [x + r4, y + height],
    // });
    // r4 !== 0 && this.paths.push({
    //   type: "arc",
    //   args: [x + r4, y + height - r4, r4, Math.PI / 2, Math.PI],
    // });
    // this.paths.push({
    //   type: "lineTo",
    //   args: [x, y + r1],
    // });
    // r1 !== 0 && this.paths.push({
    //   type: "arc",
    //   args: [x + r1, y + r1, r1, Math.PI, Math.PI * 1.5],
    // });
  }

}

class Arc extends Shape {
  constructor(args) {
    super(args);
  }

  createPath() {}
  /**
   * @param  {MouseEvent} event
   */


  isPointInPath(event) {
    return true;
  }

  renderPath(ctx) {
    ctx.beginPath();
    const {
      pos,
      radius,
      startAngle,
      endAngle,
      background,
      close
    } = this.attrs;
    const [x, y] = pos;

    if (close) {
      ctx.moveTo(x, y);
    }

    ctx.arc(x, y, radius, startAngle, endAngle, false);

    if (background) {
      ctx.fillStyle = background;
      ctx.fill();
    } // ctx.closePath();

  }

}

var shapes = {
  Rect,
  Arc
};

const kwan = {
  Scene,
  shapes
};

export default kwan;
