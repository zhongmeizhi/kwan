import { isFn } from "../utils/tool.js";

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
      this[_events][type].forEach((listener) => listener.call(this, argv));
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

export default EventDispatcher;
