const _createAxis = Symbol("_createAxis");

const _splitMesh = Symbol("_splitMesh");
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
      indexes = this.getBoundBoxIndex(shape);

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
        indexes = this.getBoundBoxIndex(this.shapes[i]);

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
    const indexes = this.getBoundBoxIndex(shape);
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
  }

  [_createAxis](x, y, subWidth, subHeight) {
    return [{
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

    const axis = this[_createAxis](x, y, subWidth, subHeight);

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


  getBoundBoxIndex(shape) {
    const {
      pos,
      size
    } = shape.attrs;
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

const _isRunning = Symbol("_isRunning");

const _run = Symbol("_run");

const _runRaf = Symbol("_runRaf");

const _getRaf = Symbol("_getRaf");

const _requestAnimationFrame = Symbol("_requestAnimationFrame");

class Loop {
  constructor(run) {
    this[_run] = run;
    this[_isRunning] = false;
    this[_requestAnimationFrame] = this[_getRaf]();
  }

  start() {
    this[_isRunning] = true;

    this[_runRaf]();
  }

  stop() {
    this[_isRunning] = false;
  }

  [_runRaf]() {
    this[_run]();

    this[_isRunning] && this[_requestAnimationFrame](this[_runRaf].bind(this));
  }

  [_getRaf]() {
    return window.requestAnimationFrame.bind(window);
  }

}

const _initBox = Symbol("_initBox");

const _initEvent = Symbol("_initEvent"); // TODO: Scene应该是一个特殊的Group


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
    this.loop = new Loop(this.update.bind(this));

    this[_initBox](ele, hd);

    this[_initEvent](ele);

    target.appendChild(ele);
  }

  [_initBox](ele, hd) {
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

  [_initEvent](ele) {
    this.hoverShapeSet = new Set();
    ele.addEventListener("click", this.onClick.bind(this));
    ele.addEventListener("mousemove", this.onMouseMove.bind(this));
  }

  append(...shapes) {
    shapes.forEach(shape => this.mesh.append(shape));
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

  getUpdateBoundBox() {
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

    return boundBox;
  }

  draw() {
    if (this.mesh.isDirty) {
      this.getUpdateBoundBox().forEach(box => {
        const {
          x,
          y,
          width,
          height
        } = box.bounds;
        this.clear(x, y, width, height);
        this.ctx.save();
        this.ctx.rect(x, y, width, height);
        this.ctx.clip();
        box.allShapeSet.forEach(shape => {
          shape.draw(this.ctx);
        });
        this.ctx.restore();
      });
    }
  }

  update() {
    this.clock = Date.now();
    this.draw();
  }

  start() {
    this.loop.start();
  }

  stop() {
    this.loop.stop();
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
      const events = shape.getEvents();

      if (events["click"] && shape.isPointInPath(event)) {
        shape.dispatchEvent("click", shape);
      }
    });
  }

  onMouseMove(event) {
    const {
      offsetX,
      offsetY
    } = event;
    this.queryMesh(offsetX, offsetY).forEach(shape => {
      const events = shape.getEvents();

      if (events["mousemove"] || events["mouseenter"] || events["mouseleave"]) {
        if (shape.isPointInPath(event)) {
          if (!this.hoverShapeSet.has(shape)) {
            shape.dispatchEvent("mouseenter", shape);
          }

          shape.dispatchEvent("mousemove", shape);
          this.hoverShapeSet.add(shape);
        } else if (this.hoverShapeSet.has(shape)) {
          shape.dispatchEvent("mouseleave", shape);
          this.hoverShapeSet.delete(shape);
        }
      }
    });
  }

}

const _computeCurAttrs = Symbol("_computeCurAttrs");

const getSingeDist = (startAttr, endAttr, rate) => {
  return startAttr + (endAttr - startAttr) * rate;
};

const getDoubleDist = (startAttr, endAttr, rate) => {
  const [v1, v2] = startAttr;
  const [endV1, endV2] = endAttr;
  return [v1 + (endV1 - v1) * rate, v2 + (endV2 - v2) * rate];
}; // options.fillMode = 'forwards' | 'backwards'


class Animator {
  constructor(shape, startAttrs, endAttrs, options = {
    duration: 0,
    fillMode: "backwards",
    iterations: 1,
    delay: 0
  }) {
    this.target = shape;
    this.startAttrs = startAttrs;
    this.endAttrs = endAttrs;
    this.options = options;
    this.loop = new Loop(this.update.bind(this));
    this.restart();
  }

  restart() {
    setTimeout(() => {
      this.effect = {
        state: "pending",
        startTiming: Date.now(),
        executionTiming: 0,
        pauseTiming: 0,
        iteration: 0
      };
      this.loop.start();
    }, this.options.delay || 0);
  }

  start() {
    if (this.effect.state === "paused") {
      const now = Date.now();
      const pauseDistTime = now - this.effect.pauseTiming;
      this.effect.startTiming += pauseDistTime;
      this.effect.state = "running";
      this.loop.start();
    }
  }

  pause() {
    if (this.effect.state === "running") {
      this.effect.state = "paused";
      this.effect.pauseTiming = Date.now();
      this.loop.stop();
    }
  }

  update() {
    this.effect.executionTiming = Date.now() - this.effect.startTiming;

    if (this.effect.state === "pending") {
      this.effect.state = "running";
    }

    if (this.isFinish()) {
      this.finish();
      return;
    }

    const curAttrs = this.getAnimationEffect();
    this.target.setAttrs(curAttrs);
  }

  finish() {
    this.effect.state = "finish";

    if (this.options.fillMode === "forwards") {
      this.target.setAttrs(this.startAttrs);
    } else {
      this.target.setAttrs(this.endAttrs);
    }

    this.loop.stop();
  }

  isFinish() {
    if (this.effect.state === "finish" || this.effect.executionTiming > this.options.duration && (!this.options.iterations || this.effect.iteration > this.options.iterations)) {
      return true;
    }

    return false;
  }

  getAnimationEffect() {
    const dist = this.effect.executionTiming;
    const duration = this.options.duration;
    const iteration = dist / duration; // 处理最后一帧稍大的情况

    if (iteration * 1000 >= this.options.iterations * duration) {
      return this.endAttrs;
    }

    let rate = dist % duration / duration;
    this.effect.iteration = Math.ceil(iteration);
    return this[_computeCurAttrs](rate);
  }

  [_computeCurAttrs](rate) {
    let curAttrs = {};
    Object.keys(this.endAttrs).forEach(key => {
      const startAttr = this.startAttrs[key];
      const endAttr = this.endAttrs[key]; // TODO: 颜色解析

      switch (key) {
        case "pos":
        case "size":
          curAttrs[key] = getDoubleDist(startAttr, endAttr, rate);
          break;

        case "radius":
        case "innerRadius":
        case "outerRadius":
        case "startAngle":
        case "endAngle":
        case "opacity":
        case "rotate":
          curAttrs[key] = getSingeDist(startAttr, endAttr, rate);
          break;
      }
    });
    return curAttrs;
  }

}

function isNumber(v) {
  return typeof v === "number";
}
const isArr = Array.isArray;
function isFn(fn) {
  return typeof fn === "function";
}
function errorHandler(msg) {
  throw new Error(msg);
}
const PI = Math.PI;
const PI2 = Math.PI * 2;
const RADIAN = PI / 180;

const EVENT_SET = new Set(["click", "mousemove", "mouseenter", "mouseleave"]);

const _events = Symbol("_events");

class EventDispatcher {
  constructor() {
    this[_events] = {};
  }

  getEvents() {
    return this[_events];
  }
  /**
   * @param  {String} type
   * @param  {Function} listener
   */


  addEventListener(type, listener) {
    if (!isFn(listener) || !EVENT_SET.has(type)) return;

    if (!this[_events][type]) {
      this[_events][type] = new Set();
    }

    this[_events][type].add(listener);
  }
  /**
   * @param  {String type
   */


  dispatchEvent(type, argv) {
    if (this[_events][type]) {
      this[_events][type].forEach(listener => listener.call(this, argv));
    }
  }
  /**
   * @param  {String} type
   * @param  {Function} listener
   */


  removeEventListener(type, listener) {
    if (!this[_events][type]) return;

    if (this[_events][type] && listener) {
      if (this[_events][type].size === 1) {
        delete this[_events][type];
      } else {
        this[_events][type].delete(listener);
      }
    }
  }

  clearEventListener(type) {
    if (type) {
      delete this[_events][type];
    } else {
      this[_events] = {};
    }
  }

}

const _animation = Symbol("_animation");

class Node extends EventDispatcher {
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
    this.createPath();
    this.meshes.forEach(mesh => mesh.setDirty(true));
  }

  getAnimator() {
    return this[_animation];
  } // TODO: 入参校验


  animate([startAttrs, endAttrs], options) {
    this[_animation] = new Animator(this, startAttrs, endAttrs, options);
    return this[_animation];
  }

  bindMeshes(mesh) {
    this.meshes.push(mesh);
  } // 旋转中心点


  setOffsetAnchor() {
    const [x, y] = this.attrs.pos;
    this.anchorX = x;
    this.anchorY = y;
  } // adjustAttr() {
  // }


  createPath() {
    errorHandler("render 需要被重写");
  }

  buildStyle(ctx) {
    const {
      boxShadow,
      rotate,
      opacity
    } = this.attrs; // TODO: 透明度等应该在路径绘制时将颜色算好

    if (isNumber(opacity)) {
      ctx.globalAlpha = opacity;
    } // TODO: 矩阵计算， 应该在创建路径时就计算好旋转和偏移


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
      const {
        background
      } = this.attrs;
      this.paths.forEach(({
        type,
        args
      }) => {
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
    this.buildStyle(ctx); // console.log(this.attrs, 'arc');

    this.buildPath(ctx);
    ctx.restore();
    this.isDirty = false;
  }

}

class Group extends Node {
  constructor(args) {
    super(args);
    this.name = "$$group";
    this.children = [];
  }
  /* override */


  createPath() {
    this.paths = [];
    this.setOffsetAnchor();
  }
  /* override */
  // FIXME: 应该在创建路径时就计算好旋转和偏移


  setOffsetAnchor() {
    const {
      pos,
      size,
      anchor
    } = this.attrs;
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
    const {
      offsetX,
      offsetY
    } = event;
    const {
      pos,
      size
    } = this.attrs;
    const [x, y] = pos;
    const [width, height] = size;

    if (offsetX > x && offsetX < x + width && offsetY > y && offsetY < y + height) {
      return true;
    }

    return false;
  }

  append(...shapes) {
    shapes.forEach(shape => this.children.push(shape));
  }
  /* override */


  buildPath(ctx) {
    const {
      pos,
      size,
      background
    } = this.attrs;
    const [x, y] = pos;
    const [width, height] = size;
    ctx.rect(x, y, width, height);
    ctx.clip();

    if (background) {
      ctx.fillStyle = background;
      ctx.fill();
    }

    ctx.beginPath(); // TODO: 矩阵计算， 应该在创建路径时就计算好旋转和偏移

    ctx.translate(x, y);
    this.children.forEach(shape => {
      shape.draw(ctx);
    });
  }

}

const _transformRadius = Symbol("_transformRadius");

const _buildPath = Symbol("_buildPath");

class Rect extends Node {
  constructor(args) {
    super(args);
    this.name = "$$rect";
  }
  /* override */


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
    this.setOffsetAnchor();

    if (!radius) {
      this.paths.push({
        type: "rect",
        args: [x, y, width, height]
      });
    } else {
      this[_buildPath](x, y, width, height, radius);
    }
  }
  /* override */
  // FIXME: 应该在创建路径时就计算好旋转和偏移


  setOffsetAnchor() {
    const {
      pos,
      size,
      anchor
    } = this.attrs;
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

  [_transformRadius](r, width, height) {
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

  [_buildPath](x, y, width, height, r) {
    if (width < 0) {
      x = x + width;
      width = -width;
    }

    if (height < 0) {
      y = y + height;
      height = -height;
    }

    const [r1, r2, r3, r4] = this[_transformRadius](r, width, height);

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

class Arc extends Node {
  constructor(args) {
    super(args);
    this.name = "$$arc";
  }
  /* override */


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
    const radius2 = radius * 2;
    this.attrs.size = [radius2, radius2];
    this.setOffsetAnchor();

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
  /* override */
  // FIXME: 应该在创建路径时就计算好旋转和偏移


  setOffsetAnchor() {
    const {
      pos,
      radius,
      anchor
    } = this.attrs;
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
    const {
      offsetX,
      offsetY
    } = event;
    const {
      pos,
      radius
    } = this.attrs;
    const [x, y] = pos;

    if (Math.sqrt((x - offsetX) ** 2 + (y - offsetY) ** 2) <= radius) {
      return true;
    }

    return false;
  }

}

class Ring extends Node {
  constructor(args) {
    super(args);
    this.name = "$$ring";
  }
  /* override */


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
    const radius2 = outerRadius * 2;
    this.attrs.size = [radius2, radius2];
    this.setOffsetAnchor();
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
  /* override */
  // FIXME: 应该在创建路径时就计算好旋转和偏移


  setOffsetAnchor() {
    const {
      pos,
      outerRadius,
      anchor
    } = this.attrs;
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
    const {
      offsetX,
      offsetY
    } = event;
    const {
      pos,
      outerRadius
    } = this.attrs;
    const [x, y] = pos;

    if (Math.sqrt((x - offsetX) ** 2 + (y - offsetY) ** 2) <= outerRadius) {
      return true;
    }

    return false;
  }

}

const kwan = {
  Scene,
  Group,
  shapes: {
    Rect,
    Arc,
    Ring
  }
};

export default kwan;
