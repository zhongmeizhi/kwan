import kwan from "../lib/kwan.js";

const random = (multi) => {
  return Math.ceil(Math.random() * multi);
};

const { Scene, shapes } = kwan;

const ele = document.getElementById("canvasContainer");

const scene = new Scene(ele, {
  width: 600,
  height: 300,
  // hd: false
});

const arr = new Array(100).fill(0).map(
  () =>
    new shapes.Rect({
      pos: [random(590), random(290)],
      background: "yellow",
      size: [20, 20],
    })
);
arr.forEach((a) => scene.append(a));
setInterval(() => {
  arr.forEach((a) => {
    a.setAttrs({
      pos: [random(590), random(290)],
    });
  });
}, 20);

const rect = new shapes.Rect({
  pos: [280, 130],
  size: [40, 40],
  background: "yellow",
  borderRadius: [8],
});

rect.addEventListener("click", () => {
  rect.setAttrs({
    borderRadius: [
      random(50),
      random(50),
      random(50),
      random(50)
    ],
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

scene.append(rect);

const arc = new shapes.Arc({
  pos: [100, 50],
  background: "yellow",
  radius: 20,
  startAngle: 0,
  endAngle: 0.5 * Math.PI,
  close: true,
});

// arc.addEventListener("click", () => {
//   arc.setAttrs({
//     pos: [random(50), random(50)],
//   });
// });

scene.append(arc);
