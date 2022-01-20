import kwan from "../lib/kwan.js";

const random = (multi) => {
  return Math.ceil(Math.random() * multi);
};

const { Scene, shapes, Group } = kwan;

const ele = document.getElementById("canvasContainer");

const scene = new Scene(ele, {
  width: 512,
  height: 512,
  // hd: false
});

const arr = new Array(0).fill(0).map(
  () =>
    new shapes.Rect({
      pos: [random(500), random(500)],
      size: [20, 20],
      background: "yellow",
      // borderRadius: [8],
    })
);
scene.append(...arr);

const rect = new shapes.Rect({
  pos: [280, 130],
  size: [40, 40],
  background: "yellow",
  borderRadius: [8],
  rotate: 30,
});

rect.addEventListener("click", () => {
  rect.setAttrs({
    borderRadius: [random(50), random(50), random(50), random(50)],
  });
});

rect.addEventListener("mouseenter", () => {
  rect.setAttrs({
    background: "red",
  });
});

rect.addEventListener("mouseleave", () => {
  rect.setAttrs({
    background: "yellow",
  });
});

const arc = new shapes.Arc({
  pos: [100, 50],
  background: "yellow",
  radius: 30,
  startAngle: 30,
  endAngle: 260,
  close: true,
  anchor: [-1, 0],
  rotate: 90,
});

arc.addEventListener("click", () => {
  arc.setAttrs({
    pos: [random(100), random(50)],
  });
});

const ring = new shapes.Ring({
  pos: [200, 200],
  background: "yellow",
  innerRadius: 20,
  outerRadius: 40,
  startAngle: 30,
  endAngle: 160,
  anchor: [0, 1],
  rotate: 90,
});

ring.addEventListener("click", () => {
  ring.setAttrs({
    pos: [random(200), random(200)],
  });
});

const group = new Group({
  pos: [330, 330],
  size: [180, 180],
  background: "yellow",
  // anchor: [0, 0],
  rotate: 30,
});

group.addEventListener("click", () => {
  group.setAttrs({
    rotate: random(360),
  });
});

const subRect = new shapes.Rect({
  pos: [90, 90],
  size: [40, 40],
  background: "#d95140",
  borderRadius: [8],
  // rotate: 30,
});

const subArc = new shapes.Arc({
  pos: [30, 30],
  background: "#d95140",
  radius: 30,
  startAngle: 30,
  endAngle: 260,
  close: true,
  // rotate: 30,
});

const subRing = new shapes.Ring({
  pos: [90, 30],
  background: "#d95140",
  innerRadius: 20,
  outerRadius: 40,
  startAngle: 30,
  endAngle: 160,
  // rotate: 30,
});

group.append(subRect, subArc, subRing);
scene.append(rect, arc, ring, group);

group.animate(
  [
    { rotate: 0, pos: [330, 330], size: [180, 180], opacity: 1 },
    { rotate: 360, pos: [130, 130], size: [80, 80], opacity: 0 },
  ],
  {
    duration: 1000,
    iterations: Infinity,
  }
);

scene.run();
