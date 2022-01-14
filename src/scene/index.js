import Mesh from "../mesh/index";

class Scene {
  constructor(target, { width, height, hd = true }) {
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
      height,
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
    }
    // ele.style.transform = "translateZ(0)";
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
      boundBox.forEach((box) => {
        const { x, y, width, height } = box.bounds;
        this.ctx.save();
        this.clear(x, y, width, height);
        this.ctx.rect(x, y, width, height);
        this.ctx.clip();
        box.allShapeSet.forEach((shape) => {
          shape.draw(this.ctx);
        });
        this.ctx.restore();
      });
    }
  }

  getAllShapes() {
    return this.mesh.allShapeSet;
  }

  onClick(event) {
    this.getAllShapes().forEach((shape) => {
      if (shape.events["click"] && shape.isPointInPath(event)) {
        shape.dispatchEvent("click");
      }
    });
  }

  onMouseMove(event) {
    this.getAllShapes().forEach((shape) => {
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
