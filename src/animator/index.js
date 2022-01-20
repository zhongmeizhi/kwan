import Loop from "../loop/index";

const _initAnimate = Symbol("_initAnimate");
const _computeCurAttrs = Symbol("_computeCurAttrs");

const getSingeDist = (startAttr, endAttr, rate) => {
  return startAttr + (endAttr - startAttr) * rate;
};

const getDoubleDist = (startAttr, endAttr, rate) => {
  const [v1, v2] = startAttr;
  const [endV1, endV2] = endAttr;
  return [v1 + (endV1 - v1) * rate, v2 + (endV2 - v2) * rate];
};

// options.fillMode = 'forwards' | 'backwards'
class Animator {
  constructor(
    shape,
    startAttrs,
    endAttrs,
    options = {
      duration: 0,
      fillMode: "backwards",
      iterations: 1,
    }
  ) {
    this.target = shape;
    this.startAttrs = startAttrs;
    this.endAttrs = endAttrs;
    this.options = options;
    this.animationEffect = {
      state: "pending",
      iteration: 0,
    };
    this.loop = new Loop(this.update.bind(this));
    this[_initAnimate]();
  }

  [_initAnimate]() {
    this.startTime = Date.now();
    this.target.setAttrs(this.startAttrs);
    // TODO: 延迟动画
    this.loop.start();
  }

  update() {
    if (this.animationEffect.state === "pending") {
      this.animationEffect.state = "running";
    }
    if (this.animationEffect.state === "finish") {
      if (this.options.fillMode === "forwards") {
        this.target.setAttrs(this.startAttrs);
      } else {
        this.target.setAttrs(this.endAttrs);
      }
      this.loop.stop();
      return;
    }
    const curAttrs = this.getAnimationEffect();
    this.target.setAttrs(curAttrs);
  }

  getAnimationEffect() {
    const lock = Date.now();
    // debugger;
    if (
      lock > this.startTime + this.options.duration &&
      (!this.options.iterations ||
        this.animationEffect.iteration > this.options.iterations)
    ) {
      this.animationEffect.state = "finish";
    }
    let rate = 1;
    if (this.animationEffect.state !== "finish") {
      const dist = lock - this.startTime;
      rate = (dist % this.options.duration) / this.options.duration;
      this.animationEffect.iteration = Math.ceil(dist / this.options.duration);
    }
    const curAttrs = this[_computeCurAttrs](rate);
    return curAttrs;
  }

  [_computeCurAttrs](rate) {
    let curAttrs = {};
    Object.keys(this.endAttrs).forEach((key) => {
      const startAttr = this.startAttrs[key];
      const endAttr = this.endAttrs[key];
      // TODO: 颜色解析
      switch (key) {
        case "pos":
        case "size":
          curAttrs[key] = getDoubleDist(startAttr, endAttr, rate);
          break;
        case "opacity":
        case "rotate":
          curAttrs[key] = getSingeDist(startAttr, endAttr, rate);
          break;
        default:
          break;
      }
    });
    return curAttrs;
  }
}

export default Animator;
