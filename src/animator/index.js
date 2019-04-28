import Loop from "../loop/index";

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
      delay: 0,
    }
  ) {
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
        iteration: 0,
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
    if (
      this.effect.state === "finish" ||
      (this.effect.executionTiming > this.options.duration &&
        (!this.options.iterations ||
          this.effect.iteration > this.options.iterations))
    ) {
      return true;
    }
    return false;
  }

  getAnimationEffect() {
    const dist = this.effect.executionTiming;
    const duration = this.options.duration;
    const iteration = dist / duration;
    // 处理最后一帧稍大的情况
    if (iteration * 1000 >= this.options.iterations * duration) {
      return this.endAttrs;
    }
    let rate = (dist % duration) / duration;
    this.effect.iteration = Math.ceil(iteration);
    return this[_computeCurAttrs](rate);
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
        case "radius":
        case "innerRadius":
        case "outerRadius":
        case "startAngle":
        case "endAngle":
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
