# 概念

场景

- 抗锯齿
- 数据持久化
  - 双缓冲
  - 放置场景
  - 放置网格
    - 处理事件
- 层级处理
- 时钟
- 绘制
  - 屏幕适配
  - 自动绘制
- 缩放

组

- 一个特殊的图形
- 放置图形
- 遍历图形
- 内部状态

图形

- 具体绘制内容
- 内部状态处理
- 动画
  - 时序动画
  - 固定帧动画 x
  - 增量动画 x

## api 构想

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
      pos: [Math.random() * 500 + 1, Math.random() * 200 + 1],
    });
  });

  rect.addEventListener("mousemove", () => {
    console.log("mousemove");
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
