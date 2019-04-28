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

export default Loop;
