import { isFn, errorHandler } from "@/tools/base.js";
import { EVENT_SET } from "./base";

class EventDispatcher {
  constructor() {
    this.events = {};
  }

  /**
   * @param  {String} type
   * @param  {Function} listener
   */
  addEventListener(type, listener) {
    if (!isFn(listener)) return errorHandler("监听对象不是一个函数");
    if (!EVENT_SET.has(type)) return;
    if (!this.events[type]) {
      this.events[type] = new Set();
    }
    this.events[type].add(listener);
  }

  /**
   * @param  {String type
   */
  dispatchEvent(type, argv) {
    if (this.events[type]) {
      this.events[type].forEach((listener) => listener.call(this, argv));
    }
  }

  /**
   * @param  {String} type
   * @param  {Function} listener
   */
  removeEventListener(type, listener) {
    if (!this.events[type]) return;
    if (this.events[type] && listener) {
      if (this.events[type].size === 1) {
        delete this.events[type];
      } else {
        this.events[type].delete(listener);
      }
    } else {
      // remove all
      delete this.events[type];
    }
  }
}

export default EventDispatcher;
