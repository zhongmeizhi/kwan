import kwan from "../lib/kwan.js";
import kLineData from "../src/mock-data.js";

const renderer = new kwan.Renderer({
  target: "#canvas",
  // dynamic: false,
  // hd: false,
});
const scene = new kwan.Scene();

kLineData.staticData.forEach((val) =>
  scene.add(
    new kwan.Arc({
      ...val,
      events: {
        mouseenter(shape) {
          shape.z = shape.style.zIndex;
          shape.o = shape.style.opacity;
          shape.style.zIndex = 1;
          shape.style.opacity = 1;
        },
        mouseleave(shape) {
          shape.style.zIndex = shape.z;
          shape.style.opacity = shape.o;
        },
        click(shape) {
          shape.core.x += (0.5 - Math.random()) * 20;
        },
      },
    })
  )
);

kLineData.dynamicData.forEach((val) => {
  scene.add(
    new kwan.Rect({
      ...val,
      events: {
        mouseenter(shape) {
          shape.mk = shape.style.background || "black";
          shape.style.background = "#ffff00";
        },
        mouseleave(shape) {
          shape.style.background = shape.mk;
          shape.mk = null;
        },
      },
      animate({ core }) {
        core.x += core.vx;
        core.y += core.vy;
        const { width, height } = renderer;
        if (core.x > width) core.x = 0;
        if (core.x < 0) core.x = width;
        if (core.y > height) core.y = 0;
        if (core.y < 0) core.y = height;
      },
    })
  );
});

renderer.render(scene);
