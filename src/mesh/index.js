import { isFn } from "../tools/base";
import Rect from "../shapes/rect";

/**
 * @param  {pRect} pRect={x,y,width,height}
 * @param  {number} max_objects=10
 * @param  {number} max_levels=4
 * @param  {number} level=0
 */
class Mesh {
  constructor(pRect, max_objects = 10, max_levels = 4, level = 0) {
    this.max_objects = max_objects;
    this.max_levels = max_levels;
    this.level = level;
    this.bounds = pRect;
    this.children = [];
    this.shapes = [];
    this.allShapeSet = new Set();
  }

  setDirty(flag) {
    this.dirty = flag;
    if (flag) {
      let parent = this.parent;
      if (parent && !parent.dirty) {
        parent.setDirty(true);
      }
    }
  }

  /**
   * @param  {} shape
   * 一个图形可以放置到多个网格中
   */
  append(shape) {
    this.setDirty(true);
    this.allShapeSet.add(shape);

    let i = 0,
      indexes;
    // 如果有子mesh则插入最下层mesh
    if (this.children.length) {
      indexes = this._getIndex(shape);
      for (i = 0; i < indexes.length; i++) {
        this.children[indexes[i]].append(shape);
      }
      return;
    }

    this.shapes.push(shape);
    // 分割mesh
    if (
      this.shapes.length > this.max_objects &&
      this.level < this.max_levels &&
      (this.bounds.width >= 128 || this.bounds.height >= 128)
    ) {
      if (!this.children.length) {
        this._splitMesh();
      }
      for (i = 0; i < this.shapes.length; i++) {
        indexes = this._getIndex(this.shapes[i]);
        for (let k = 0; k < indexes.length; k++) {
          this.children[indexes[k]].append(this.shapes[i]);
        }
      }
      this.shapes = [];
    } else {
      shape.bindMeshes(this);
    }
  }

  _getBoundAttr(bound) {
    let result = { ...bound.attrs };
    if (result.radius) {
      const diameter = result.radius * 2;
      result.size = [diameter, diameter];
    } else {
    }
    return result;
  }

  _splitMesh() {
    let nextLevel = this.level + 1;
    const { x, y, width, height } = this.bounds;
    let subWidth = width / 2;
    let subHeight = height / 2;

    const axis = [
      {
        x: x + subWidth,
        y: y,
      },
      {
        x: x,
        y: y,
      },
      {
        x: x,
        y: y + subHeight,
      },
      {
        x: x + subWidth,
        y: y + subHeight,
      },
    ];

    axis.forEach(({ x, y }) => {
      const mesh = new Mesh(
        { x, y, width: subWidth, height: subHeight },
        this.max_objects,
        this.max_levels,
        nextLevel
      );
      mesh.parent = this;
      this.children.push(mesh);
    });
  }

  /**
   * @param {Shape} shape
   * @return {number[]}
   */
  _getIndex(shape) {
    const { pos, size } = this._getBoundAttr(shape);
    const [x, y] = pos;
    const [width, height] = size;
    let indexes = [],
      verticalMidpoint = this.bounds.x + this.bounds.width / 2,
      horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

    let startIsNorth = y < horizontalMidpoint,
      startIsWest = x < verticalMidpoint,
      endIsEast = x + width > verticalMidpoint,
      endIsSouth = y + height > horizontalMidpoint;

    if (startIsNorth && endIsEast) {
      indexes.push(0);
    }
    if (startIsWest && startIsNorth) {
      indexes.push(1);
    }
    if (startIsWest && endIsSouth) {
      indexes.push(2);
    }
    if (endIsEast && endIsSouth) {
      indexes.push(3);
    }

    return indexes;
  }
}

export default Mesh;
