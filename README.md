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

  scene.append(rect);
```

## TODO_LIST

- [ ] 将 example 抽离，利用 yalc 进行测试调试
- [ ] 工程管理
- [x] 分块渲染
- [ ] 多层渲染
- [ ] 离线渲染
- [ ] 优化层级
- [ ] 文档
- [ ] 引入单元测试
- [ ] webGl
