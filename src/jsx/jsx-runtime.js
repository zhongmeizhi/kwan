import h, { fragment } from "./h";
import mount from "./mount";

export const jsx = h;
export const jsxs = h;
export const Fragment = fragment;

const kwan = {
  h,
  fragment,
  mount,
};

export default kwan;
