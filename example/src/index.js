import kwan from "../lib/kwan.js";

const random = (multi) => {
  return Math.ceil(Math.random() * multi);
};

const { Scene, shapes } = kwan;

const ele = document.getElementById("canvasContainer");

const scene = new Scene(ele, {
  width: 512,
  height: 512,
  // hd: false
});

// const arr = new Array(1000).fill(0).map(
//   () =>
//     new shapes.Rect({
//       pos: [random(500), random(500)],
//       background: "yellow",
//       size: [20, 20],
//       // borderRadius: [8],
//     })
// );
// arr.forEach((a) => scene.append(a));

// const rect = new shapes.Rect({
//   pos: [280, 130],
//   size: [40, 40],
//   background: "yellow",
//   borderRadius: [8],
// });

// rect.addEventListener("click", () => {
//   rect.setAttrs({
//     borderRadius: [random(50), random(50), random(50), random(50)],
//   });
// });

// rect.addEventListener("mouseenter", () => {
//   rect.setAttrs({
//     background: "red",
//   });
// });

// rect.addEventListener("mouseleave", () => {
//   rect.setAttrs({
//     background: "yellow",
//   });
// });

// scene.append(rect);

// const arc = new shapes.Arc({
//   pos: [100, 50],
//   background: "yellow",
//   radius: 30,
//   startAngle: 30,
//   endAngle: 260,
//   close: true,
// });

// arc.addEventListener("click", () => {
//   arc.setAttrs({
//     pos: [random(100), random(50)],
//   });
// });

scene.append(arc);

const ring = new shapes.Ring({
  pos: [200, 200],
  background: "yellow",
  innerRadius: 20,
  outerRadius: 40,
  startAngle: 30,
  endAngle: 160,
});

ring.addEventListener("click", () => {
  ring.setAttrs({
    pos: [random(200), random(200)],
  });
});

scene.append(ring);

const run = () => {
  // rect.setAttrs({
  //   borderRadius: [random(50), random(50), random(50), random(50)],
  //   background: 'red'
  // });
  scene.update();
  requestAnimationFrame(run);
};
run();
