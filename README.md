# Readme

一个 2d 版 canvas 绘图库，模拟浏览器绘制过程，拥有卓越的 dps 性能体验，简单好记的 api 与 css3 一致的开发体验

`yarn add kwan`

## 组成结构

1. 渲染器 Renderer

渲染器用来放置场景，指定渲染元素，是否防锯齿等。

```
new kwan.Renderer({
  target: "#canvas",
  // hd: false,
});
```

2. 场景

场景用来放置图形、网格的分配、图形的寻址、时间轴的把控等

```
new kwan.Scene();
```

3. 图形

目前主要支持方形`Rect`和圆形`Arc`

```
new kwan.Rect({
  core: {
    x: 150,
    y: 50,
    width: 30,
    height: 20,
    vx: 10,
    vy: 10,
  },
  style: {
    zIndex: 1,
    opacity: 0.6,
    background: "#C93860",
    border: `2 solid #fff`,
    borderRadius: [1, 2, 3, 4],
  },
  events: {
    mouseenter(shape) {
    },
    mouseleave(shape) {
    },
    click(shape) {
    },
  },
})
```

## TODO_LIST

- [ ] 将 example 抽离，利用 yalc 进行测试调试
- [ ] 优化 dps
- [ ] 优化层级 -> 目前思路是添加层级表
- [ ] 添加 Group 概念
- [ ] 文档
- [ ] 引入单元测试

