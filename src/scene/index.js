import Mesh from "../mesh/index";
import Loop from "../loop/index";
import { errorHandler } from "../utils/tool";

const _initBox = Symbol("_initBox");
const _initEvent = Symbol("_initEvent");

// TODO: Scene应该是一个特殊的Group
class Scene {
  constructor(target, { width, height, hd = true }) {
    if (!target || !(target instanceof HTMLElement)) {
      errorHandler("Error: don't find DOM:" + target);
    }
    const ele = document.createElement("canvas");
    this.ctx = ele.getContext("2d");
    this.width = width;
    this.height = height;
    this.mesh = new Mesh({
      x: 0,
      y: 0,
      width,
      height,
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
    }
    // ele.style.transform = "translateZ(0)";
  }

  [_initEvent](ele) {
    this.hoverShapeSet = new Set();
    ele.addEventListener("click", this.onClick.bind(this));
    ele.addEventListener("mousemove", this.onMouseMove.bind(this));
  }

  append(...shapes) {
    shapes.forEach((shape) => this.mesh.append(shape));
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
      const children = item.children;
      // 容器元素收录
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
      this.getUpdateBoundBox().forEach((box) => {
        const { x, y, width, height } = box.bounds;
        this.clear(x, y, width, height);
        this.ctx.save();
        this.ctx.rect(x, y, width, height);
        this.ctx.clip();
        box.allShapeSet.forEach((shape) => {
          shape.draw(this.ctx);
        });
        this.ctx.restore();
      });
    }
  }

  update() {
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
      attrs: { pos: [x, y], size: [blur, blur] },
    });
  }

  onClick(event) {
    const { offsetX, offsetY } = event;
    this.queryMesh(offsetX, offsetY).forEach((shape) => {
      const events = shape.getEvents();
      if (events["click"] && shape.isPointInPath(event)) {
        shape.dispatchEvent("click", shape);
      }
    });
  }

  onMouseMove(event) {
    const { offsetX, offsetY } = event;
    this.queryMesh(offsetX, offsetY).forEach((shape) => {
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

export default Scene;
