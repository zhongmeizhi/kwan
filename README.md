# Kwan

一个轻量级的 canvas 2d 绘图库。具有卓越的性能，支持分块渲染和局部重绘。

## 安装

> yarn add kwan

## 例子

```js
  const ele = document.getElementById("canvasContainer");

  const scene = new Scene(ele, {
    width: 600,
    height: 300,
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

  rect.addEventListener("mousemove", () => {
    console.log('mousemove');
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
  });

  arc.animate(
    [
      { rotate: 0, pos: [100, 50], radius: 30,, opacity: 1 },
      { rotate: 360, pos: [0, 0], radius: 0,, opacity: 0 },
    ],
    {
      duration: 1000,
      iterations: Infinity,
    }
  );

  scene.append(rect, arc);
```

## TODO_LIST

- [ ] 版本管理
- [ ] TS重构
- [x] 时序动画
- [x] 分块渲染
- [x] 局部重绘
- [ ] 离线渲染
- [ ] 优化层级
- [ ] 文档
- [ ] 引入单元测试
- [ ] webGl
