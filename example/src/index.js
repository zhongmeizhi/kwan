import kwan from "../lib/kwan.js";

const { Scene, shapes } = kwan;

const ele = document.getElementById("canvasContainer");

const scene = new Scene(ele, {
  width: 600,
  height: 300,　
  // hd: false
});

const rect = new shapes.Rect({
  pos: [250, 100],
  size: [100, 100],
  background: "yellow",
  border: ["8", "solid", "red"],
  borderRadius: [8],
});

rect.addEventListener("click", () => {
  rect.setAttrs({
    borderRadius: [Math.random() * 50 + 1],
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
  close: true
});

arc.addEventListener("click", () => {
  arc.setAttrs({
    pos: [Math.random() * 100 + 1, Math.random() * 50 + 1],
  });
});

scene.append(arc);
