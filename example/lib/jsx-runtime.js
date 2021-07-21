(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['jsx-runtime'] = {}));
}(this, (function (exports) { 'use strict';

  function h(Component, props, ...children) {
    const _props = props || {};

    _props.children = children || [];
    return {
      Component,
      props: _props
    };
  }
  function fragment(props) {
    return props.children;
  }

  class Animation {
    constructor(run) {
      this.run = run;
      this._running = false;
      this.requestAnimationFrame = this._getRaf();
    }

    start() {
      this._running = true;

      this._runAnimation();
    }

    stop() {
      this._running = false;
    }

    _runAnimation() {
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

  class Renderer {
    /**
     * @param  {string} target
     * @param  {boolean} dynamic
     * @param  {boolean} hd
     */
    constructor({
      target,
      dynamic = true,
      hd = true
    }) {
      const ele = document.querySelector(target);

      if (!ele) {
        throw new Error("不能找到匹配的dom元素");
      }

      this.element = ele;
      this.ctx = ele.getContext("2d");
      this.width = ele.width;
      this.height = ele.height;
      this.dpr = 1;
      this.hd = hd;
      this.scene = null;
      this.animate = new Animation(this._run.bind(this));
      hd && this._initHd(ele);
    }

    clear() {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    /**
     * @param  {Scene} scene
     */


    render(scene) {
      this.scene = scene;
      scene.init(this);
      this.animate.start();
    }

    update() {
      if (this.scene.dirtySet.size) {
        const scene = this.scene;
        scene.update(); // TODO: 局部更新
        // ctx.clip();
      }
    }

    forceUpdate() {
      this.clear();
      const scene = this.scene;
      scene.update();
      scene.shapePools.forEach(shape => {
        this.ctx.save();
        this.ctx.beginPath();

        this._drawStyle(shape.style);

        this._drawPath(shape.path);

        this.ctx.closePath();

        if (shape.strokeAble) {
          this.ctx.stroke();
        }

        if (shape.fillAble) {
          this.ctx.fill();
        }

        this.ctx.restore();
      });
    }

    _run() {
      this.scene.animate();
      this.forceUpdate();
    }
    /**
     * 抗锯齿
     * @param  {HTMLElement} ele
     */


    _initHd(ele) {
      this.dpr = window.devicePixelRatio;
      ele.style.width = this.width + "px";
      ele.style.height = this.height + "px";
      ele.width = this.width * this.dpr;
      ele.height = this.height * this.dpr;
      this.ctx.scale(this.dpr, this.dpr);
      this.ctx.save();
    }

    _drawStyle(style) {
      const ctx = this.ctx;

      for (let k of Object.keys(style)) {
        const val = style[k];

        if (val === "none") {
          continue;
        }

        switch (k) {
          case "background":
            ctx.fillStyle = val;
            break;

          case "opacity":
            ctx.globalAlpha = val;
            break;

          case "boxShadow":
            const [shadowColor, x, y, blur] = val.split(" ");

            if (shadowColor && x && y && blur) {
              ctx.shadowColor = shadowColor;
              ctx.shadowOffsetX = x;
              ctx.shadowOffsetY = y;
              ctx.shadowBlur = blur;
            }

            break;

          case "zIndex":
            if (val > 0) {
              ctx.globalCompositeOperation = "source-over";
            } else {
              ctx.globalCompositeOperation = "destination-over";
            }

            break;

          case "border":
            const [width, solid, color] = val.split(" ");

            if (width && solid && color) {
              ctx.lineWidth = width;
              ctx.strokeStyle = color;
            }

            break;
        }
      }
    }

    _drawPath(path) {
      path.forEach(({
        type,
        args
      }) => {
        this.ctx[type](...args);
      });
    }

  }

  /**
   * @param  {Shape} shape
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
      this.objects = [];
      this.nodes = [];
    }
    /**
     * @param  {} shape
     */


    insert(shape) {
      let i = 0,
          indexes;

      if (this.nodes.length) {
        indexes = this._getIndex(shape);

        for (i = 0; i < indexes.length; i++) {
          this.nodes[indexes[i]].insert(shape);
        }

        return;
      }

      shape.parentBound = this.objects;
      this.objects.push(shape);

      if (this.objects.length > this.max_objects && this.level < this.max_levels) {
        if (!this.nodes.length) {
          this._splitMesh();
        }

        for (i = 0; i < this.objects.length; i++) {
          indexes = this._getIndex(this.objects[i]);

          for (let k = 0; k < indexes.length; k++) {
            this.nodes[indexes[k]].insert(this.objects[i]);
          }
        }

        this.objects = [];
      }
    }
    /**
     * @param  {} shape
     */


    retrieve(shape) {
      let indexes = this._getIndex(shape),
          returnObjects = this.objects;

      if (this.nodes.length) {
        for (let i = 0; i < indexes.length; i++) {
          returnObjects = returnObjects.concat(this.nodes[indexes[i]].retrieve(shape));
        }
      } // 筛选，感觉算法可以优化


      returnObjects = returnObjects.filter(function (item, index) {
        return returnObjects.indexOf(item) >= index;
      });
      return returnObjects;
    }
    /**
     * @param  {number} mouseX
     * @param  {number} mouseY
     * @param  {number} blur
     */


    queryMouse({
      offsetX,
      offsetY
    }, blur = 4) {
      return this.retrieve({
        x: offsetX,
        y: offsetY,
        width: blur,
        height: blur
      });
    }

    clear() {
      this.objects = [];

      for (let i = 0; i < this.nodes.length; i++) {
        if (this.nodes.length) {
          this.nodes[i].clear();
        }
      }

      this.nodes = [];
    }
    /**
     * @param  {} shape
     */


    update(shape) {
      if (shape.parentBound) {
        const idx = shape.parentBound.findIndex(item => item === shape);
        shape.parentBound.splice(idx, 1);
        delete shape.parentBound;
        const root = this.findRoot();
        root.insert(shape);
      }
    }

    findRoot() {
      let mesh = this;

      while (mesh.parentMesh) {
        mesh = mesh.parentMesh;
      }

      return mesh;
    }

    _getBoundAttr(bound) {
      let attr = bound.core || bound;
      let result = { ...attr
      };

      if (result.radius) {
        const diameter = result.radius * 2;
        result.width = diameter;
        result.height = diameter;
      }

      return result;
    }

    _splitMesh() {
      let nextLevel = this.level + 1;

      const {
        x,
        y,
        width,
        height
      } = this._getBoundAttr(this.bounds);

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
        mesh.parentMesh = this;
        this.nodes.push(mesh);
      });
    }
    /**
     * @param {Shape} shape
     * @return {number[]}
     */


    _getIndex(shape) {
      const {
        x,
        y,
        width,
        height
      } = this._getBoundAttr(shape);

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

  function isFn(fn) {
    return typeof fn === "function";
  }

  class Scene {
    /**
     * @param  {} {core
     * @param  {} style}={}
     */
    constructor({
      core,
      style
    } = {}) {
      // TODO: 添加 Scene 的样式
      this.dirtySet = new Set();
      this.hoverSet = new Set();
      this.enterSet = new Set();
      this.shapePools = new Set();
      this.animateSet = new Set();
    }
    /**
     * @param  {Shape} shape
     */


    add(shape) {
      this.shapePools.add(shape);
      this.dirtySet.add(shape);
    }

    init(renderer) {
      const {
        width,
        height,
        element,
        ctx
      } = renderer;
      this.ctx = ctx;

      this._initMesh(width, height);

      this._appendShape();

      this._initEvents(element);
    }

    update() {
      this.dirtySet.forEach(item => {
        item.adjustDrawStrategy();
        item.createPath();
        item.dirty = false;
      });
      this.dirtySet.clear();
    }

    animate() {
      this.animateSet.forEach(anm => anm());
    }
    /**
     * @param  {number} width
     * @param  {number} height
     */


    _initMesh(width, height) {
      this.mesh = new Mesh({
        x: 0,
        y: 0,
        width,
        height
      });
    }

    _appendShape() {
      this.shapePools.forEach(shape => {
        if (shape.events && Object.keys(shape.events).length) {
          this.mesh.insert(shape);
        }

        if (isFn(shape.animate)) {
          this.animateSet.add(() => {
            shape.animate.call(shape, shape);
          });
        }

        shape.addListener("update", () => {
          this.mesh.update(shape);
          this.dirtySet.add(shape);
        });
        shape.addListener("remove", shape => {
          this.shapePools.delete(shape);
          this.mesh.remove(shape);
        });
      });
    }
    /**
     * @param  {HtmlElement} element
     */


    _initEvents(element) {
      element.addEventListener("click", event => {
        this.mesh.queryMouse(event).forEach(shape => {
          const isPointInPath = shape.isPointInPath(event);
          isPointInPath && shape.eventHandler("click", event);
        });
      });
      element.addEventListener("mousemove", event => {
        this.mesh.queryMouse(event).forEach(shape => {
          const isPointInPath = shape.isPointInPath(event);

          if (isPointInPath) {
            this.enterSet.add(shape);
            shape.eventHandler("mousemove", event);
          }

          if (!this.hoverSet.has(shape) && isPointInPath) {
            this.hoverSet.add(shape);
            shape.eventHandler("mouseenter", event);
          }
        }); // 处理可能存在的mesh边界问题，找到mouseleave的shape

        this.hoverSet.forEach(shape => {
          if (!this.enterSet.has(shape)) {
            this.hoverSet.delete(shape);
            shape.eventHandler("mouseleave", event);
          }
        });
        this.enterSet = new Set();
      });
    }

  }

  function traverseGeometry(scene, item) {
    if (Array.isArray(item)) {
      item.forEach(sub => {
        traverseGeometry(scene, sub);
      });
    } else {
      const {
        Component,
        props: {
          children,
          ...val
        } = {}
      } = item;

      if (Component) {
        scene.add(new Component(val));
      }

      if (children) {
        children.forEach(sub => {
          traverseGeometry(scene, sub);
        });
      }
    }
  }

  function mount(root, {
    props
  }) {
    const renderer = new Renderer(root);
    const scene = new Scene(props);
    props.children.forEach(item => {
      traverseGeometry(scene, item);
    });
    renderer.render(scene).animation();
  }

  const jsx = h;
  const jsxs = h;
  const Fragment = fragment;
  const kwan = {
    h,
    fragment,
    mount
  };

  exports.Fragment = Fragment;
  exports.default = kwan;
  exports.jsx = jsx;
  exports.jsxs = jsxs;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
