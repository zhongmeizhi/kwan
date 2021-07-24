# Kwan

一个 2d 版 canvas 绘图库，参考浏览器绘制过程，拥有卓越的 dps 性能体验，简单好记的 api 与 css3 一致的开发体验

`yarn add kwan`

## 组成结构

1. 渲染器 Renderer

渲染器用来放置场景，指定元素，开启防锯齿等。

```
new kwan.Renderer({
  target: "#canvas",
  // hd: false,
});
```

2. 场景

场景用来放置图形、事件寻址、时间轴的把控等

```
new kwan.Scene();
```

3. 图形

目前主要支持方形`Rect`和圆形`Arc`，响应式属性更新。

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
- [ ] 分块渲染
- [ ] 多层渲染
- [ ] 离线渲染
- [ ] 优化层级
- [ ] 文档
- [ ] 引入单元测试

