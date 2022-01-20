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

export const PI = Math.PI;

export const PI2 = Math.PI * 2;

export const RADIAN = PI / 180;
