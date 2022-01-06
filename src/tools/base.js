export function isNumber(v) {
  return typeof v === "number";
}

export const isArr = Array.isArray;

export function isFn(fn) {
  return typeof fn === "function";
}

export function errorHandler(msg) {
  throw new Error(msg);
}

export const EVENT_SET = new Set([
  "click",
  "mousemove",
  "mouseenter",
  "mouseleave",
]);
