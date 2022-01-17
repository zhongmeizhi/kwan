const _getBoundAttr = Symbol("_getBoundAttr");

const _splitMesh = Symbol("_splitMesh");

const _getIndex = Symbol("_getIndex");
/**
 * @param  {pRect} pRect={x,y,width,height}
 * @param  {number} max_objects=10
 * @param  {number} max_levels=4
 * @param  {number} level=0
 */


class Mesh {
  constructor(pRect, max_objects = 10, max_levels = 4, level = 0) {
    this.max_objects = max_objects;
    this.max_levels = max_levels;
    this.level = level;
    this.bounds = pRect;
    this.children = [];
    this.shapes = [];
    this.allShapeSet = new Set();
  }

  setDirty(flag) {
    this.isDirty = flag;

    if (flag) {
      let parent = this.parent;

      if (parent && !parent.isDirty) {
        parent.setDirty(true);
      }
    }
  }
  /**
   * @param  {} shape
   * 一个图形可以放置到多个网格中
   */


  append(shape) {
    this.setDirty(true);
    this.allShapeSet.add(shape);
    let i = 0,
        indexes; // 如果有子mesh则插入最下层mesh

    if (this.children.length) {
      indexes = this[_getIndex](shape);

      for (i = 0; i < indexes.length; i++) {
        this.children[indexes[i]].append(shape);
      }

      return;
    }

    this.shapes.push(shape); // 分割mesh

    if (this.shapes.length > this.max_objects && this.level < this.max_levels && (this.bounds.width >= 128 || this.bounds.height >= 128)) {
      if (!this.children.length) {
        this[_splitMesh]();
      }

      for (i = 0; i < this.shapes.length; i++) {
        indexes = this[_getIndex](this.shapes[i]);

        for (let k = 0; k < indexes.length; k++) {
          this.children[indexes[k]].append(this.shapes[i]);
        }
      }

      this.shapes = [];
    } else {
      shape.bindMeshes(this);
    }
  }
  /**
   * @param  {} shape
   */


  retrieve(shape) {
    const indexes = this[_getIndex](shape);

    let returnShapes = this.shapes;

    if (this.children.length) {
      for (let i = 0; i < indexes.length; i++) {
        returnShapes = returnShapes.concat(this.children[indexes[i]].retrieve(shape));
      }
    } // TODO: 优化查找算法


    returnShapes = returnShapes.filter(function (item, index) {
      return returnShapes.indexOf(item) >= index;
    });
    return returnShapes;
  } // 边界盒子统一获取方法


  [_getBoundAttr](bound) {
    let result = { ...bound.attrs
    };

    if (result.radius) {
      const diameter = result.radius * 2;
      result.size = [diameter, diameter];
    }

    return result;
  }

  [_splitMesh]() {
    let nextLevel = this.level + 1;
    const {
      x,
      y,
      width,
      height
    } = this.bounds;
    let subWidth = width / 2;
    let subHeight = height / 2;
    const axis = [{
      x: x + subWidth,
      y: y
    }, {
      x: x,
      y: y
    }, {
      x: x,
      y: y + subHeight
    }, {
      x: x + subWidth,
      y: y + subHeight
    }];
    axis.forEach(({
      x,
      y
    }) => {
      const mesh = new Mesh({
        x,
        y,
        width: subWidth,
        height: subHeight
      }, this.max_objects, this.max_levels, nextLevel);
      mesh.parent = this;
      this.children.push(mesh);
    });
  }
  /**
   * @param {Shape} shape
   * @return {number[]}
   */


  [_getIndex](shape) {
    const {
      pos,
      size
    } = this[_getBoundAttr](shape);

    const [x, y] = pos;
    const [width, height] = size;
    let indexes = [],
        verticalMidpoint = this.bounds.x + this.bounds.width / 2,
        horizontalMidpoint = this.bounds.y + this.bounds.height / 2;
    let startIsNorth = y < horizontalMidpoint,
        startIsWest = x < verticalMidpoint,
        endIsEast = x + width > verticalMidpoint,
        endIsSouth = y + height > horizontalMidpoint;

    if (startIsNorth && endIsEast) {
      indexes.push(0);
    }

    if (startIsWest && startIsNorth) {
      indexes.push(1);
    }

    if (startIsWest && endIsSouth) {
      indexes.push(2);
    }

    if (endIsEast && endIsSouth) {
      indexes.push(3);
    }

    return indexes;
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
    this.mesh = new Mesh({
      x: 0,
      y: 0,
      width,
      height
    });
    this._version = 0;

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
    } // ele.style.transform = "translateZ(0)";

  }

  _initEvent(ele) {
    this.hoverShapeSet = new Set();
    ele.addEventListener("click", this.onClick.bind(this));
    ele.addEventListener("mousemove", this.onMouseMove.bind(this));
  }

  append(shape) {
    this.mesh.append(shape);
    this._version++;
  }

  clear(x, y, width, height) {
    this.ctx.clearRect(x, y, width, height);
  }

  clearAll() {
    this.clear(0, 0, this.width, this.height);
  }

  isMergeMesh(mesh) {
    const children = mesh.children;

    if (children && children.length) {
      const tr = children[0].isDirty;
      const tl = children[1].isDirty;
      const bl = children[2].isDirty;
      const br = children[3].isDirty;
      return tr + tl + bl + br > 2;
    }

    return true;
  }

  update() {
    if (this.mesh.isDirty) {
      const boundBox = [];
      const updateStack = [this.mesh];

      while (updateStack.length) {
        const item = updateStack.pop();
        item.isDirty = false;
        const children = item.children; // 容器元素收录

        if (item.shapes.length) {
          boundBox.push(item);
          continue;
        }

        if (this.isMergeMesh(item)) {
          // 块合并
          boundBox.push(item);
          const cleanStack = [item];

          while (cleanStack.length) {
            const sub = cleanStack.pop();
            const children = sub.children;

            for (let i = children.length - 1; i >= 0; i--) {
              children[i].isDirty = false;
              cleanStack.push(children[i]);
            }
          }
        } else {
          for (let i = children.length - 1; i >= 0; i--) {
            const child = children[i];

            if (child.isDirty) {
              updateStack.push(child);
            }
          }
        }
      }

      boundBox.forEach(box => {
        const {
          x,
          y,
          width,
          height
        } = box.bounds;
        this.ctx.save();
        this.clear(x, y, width, height);
        this.ctx.rect(x, y, width, height);
        this.ctx.clip();
        box.allShapeSet.forEach(shape => {
          shape.draw(this.ctx);
        });
        this.ctx.restore();
      });
    }
  }

  queryMesh(x, y, blur = 2) {
    return this.mesh.retrieve({
      attrs: {
        pos: [x, y],
        size: [blur, blur]
      }
    });
  }

  onClick(event) {
    const {
      offsetX,
      offsetY
    } = event;
    this.queryMesh(offsetX, offsetY).forEach(shape => {
      if (shape.events["click"] && shape.isPointInPath(event)) {
        shape.dispatchEvent("click");
      }
    });
  }

  onMouseMove(event) {
    const {
      offsetX,
      offsetY
    } = event;
    this.queryMesh(offsetX, offsetY).forEach(shape => {
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
function errorHandler$1(msg) {
  throw new Error(msg);
}

function isNumber(v) {
  return typeof v === "number";
}
const isArr = Array.isArray;
function errorHandler(msg) {
  throw new Error(msg);
}
const PI = Math.PI;
const PI2 = Math.PI * 2;
const RADIAN = PI / 180;
const EVENT_SET = new Set(["click", "mousemove", "mouseenter", "mouseleave"]);

class EventDispatcher {
  constructor() {
    this.events = {};
  }
  /**
   * @param  {String} type
   * @param  {Function} listener
   */


  addEventListener(type, listener) {
    if (!isFn(listener)) return errorHandler$1("监听对象不是一个函数");
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

    this.meshes.forEach(mesh => mesh.setDirty(true));
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

  renderPath() {
    errorHandler("renderPath 需要被重写");
  }

  draw(ctx) {
    ctx.save();
    this.renderPath(ctx);
    ctx.restore();
    this.isDirty = false;
  }

}

class Rect extends Shape {
  constructor(args) {
    super(args);
    this.name = "$$rect";
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
      size
    } = this.attrs;
    const [x, y] = pos;
    const [width, height] = size; // TODO: 优化弧形点击

    if (offsetX > x && offsetX < x + width && offsetY > y && offsetY < y + height) {
      return true;
    }

    return false;
  }

  renderPath(ctx) {
    ctx.beginPath();
    const {
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
    ctx.closePath();

    if (background) {
      ctx.fillStyle = background;
      ctx.fill();
    }
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
    });
  }

}

class Arc extends Shape {
  constructor(args) {
    super(args);
    this.name = "$$arc";
  }

  createPath() {
    this.paths = [];
    let {
      pos,
      radius,
      startAngle,
      endAngle,
      close
    } = this.attrs;
    const [x, y] = pos;
    startAngle = RADIAN * startAngle;
    endAngle = RADIAN * endAngle;

    if (close) {
      this.paths.push({
        type: "moveTo",
        args: [x, y]
      });
    }

    this.paths.push({
      type: "arc",
      args: [x, y, radius, startAngle, endAngle, false]
    });
  }
  /**
   * @param  {MouseEvent} event
   */


  isPointInPath(event) {
    // TODO: 扇形边界
    const {
      offsetX,
      offsetY
    } = event;
    const {
      pos,
      radius
    } = this.attrs;
    const [x, y] = pos;

    if (Math.sqrt(Math.pow(x - offsetX, 2) + Math.pow(y - offsetY, 2)) <= radius) {
      return true;
    }

    return false;
  }

  renderPath(ctx) {
    ctx.beginPath();
    let {
      background,
      opacity
    } = this.attrs;

    if (isNumber(opacity)) {
      ctx.globalAlpha = opacity;
    }

    this.paths.forEach(({
      type,
      args
    }) => {
      ctx[type](...args);
    });

    if (background) {
      ctx.fillStyle = background;
      ctx.fill();
    } // ctx.closePath();

  }

}

class Ring extends Shape {
  constructor(args) {
    super(args);
    this.name = "$$ring";
  }

  createPath() {
    this.paths = [];
    let {
      pos,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle
    } = this.attrs;
    const [x, y] = pos;
    startAngle = RADIAN * startAngle;
    endAngle = RADIAN * endAngle;
    this.paths.push({
      type: "arc",
      args: [x, y, outerRadius, startAngle, endAngle, false]
    });

    if (innerRadius > 0) {
      if (endAngle < startAngle) {
        endAngle = startAngle + PI2 + (endAngle - startAngle) % PI2;
      }

      if (endAngle - startAngle >= PI2) {
        endAngle = startAngle + PI2 - 1e-6;
      }

      this.paths.push({
        type: "arc",
        args: [x, y, innerRadius, endAngle, startAngle, true]
      });
    }
  }
  /**
   * @param  {MouseEvent} event
   */


  isPointInPath(event) {
    // TODO: 环形边界
    const {
      offsetX,
      offsetY
    } = event;
    const {
      pos,
      outerRadius
    } = this.attrs;
    const [x, y] = pos;

    if (Math.sqrt(Math.pow(x - offsetX, 2) + Math.pow(y - offsetY, 2)) <= outerRadius) {
      return true;
    }

    return false;
  }

  renderPath(ctx) {
    ctx.beginPath();
    let {
      background,
      opacity
    } = this.attrs;

    if (isNumber(opacity)) {
      ctx.globalAlpha = opacity;
    }

    this.paths.forEach(({
      type,
      args
    }) => {
      ctx[type](...args);
    });
    ctx.closePath();

    if (background) {
      ctx.fillStyle = background;
      ctx.fill();
    } // ctx.closePath();

  }

}

var shapes = {
  Rect,
  Arc,
  Ring
};

const kwan = {
  Scene,
  shapes
};

export default kwan;
