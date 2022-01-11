import { isFn } from "../tools/base";
import Loop from "../tools/loop";

class Scene {
  constructor(target, { width, height, hd = true }) {
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
      isFn(callback) && callback(shape);
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
    this._traverseShapes((shape) => shape.draw(this.ctx));
  }

  onClick(event) {
    this._traverseShapes((shape) => {
      if (shape.events["click"] && shape.isPointInPath(event)) {
        shape.dispatchEvent("click");
      }
    });
  }

  onMouseMove(event) {
    this._traverseShapes((shape) => {
      let withInPath = false;
      if (
        shape.events["mousemove"] ||
        shape.events["mouseenter"] ||
        shape.events["mouseleave"]
      ) {
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

export default Scene;
