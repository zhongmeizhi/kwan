# Kwan

一个 2d 版 canvas 绘图库，参考浏览器绘制过程，拥有卓越的 dps 性能体验，简单好记的 api 与 css3 一致的开发体验

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
- [ ] 分块渲染
- [ ] 多层渲染
- [ ] 离线渲染
- [ ] 优化层级
- [ ] 文档
- [ ] 引入单元测试
- [ ] webGl
