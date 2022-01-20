
const _running = Symbol("_running");
const _runRaf = Symbol("_runRaf");
const _getRaf = Symbol("_getRaf");

class Loop {
  constructor(run) {
    this.run = run;
    this[_running] = false;
    this.requestAnimationFrame = this[_getRaf]();
  }

  start() {
    this[_running] = true;
    this[_runRaf]();
  }

  stop() {
    this[_running] = false;
  }

  [_runRaf]() {
    this.run();
    this[_running] && this.requestAnimationFrame(this[_runRaf].bind(this));
  }

  [_getRaf]() {
    return window.requestAnimationFrame.bind(window);
  }
}

export default Loop;
