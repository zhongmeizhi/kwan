const _createAxis = Symbol("_createAxis");
const _splitMesh = Symbol("_splitMesh");

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
    this.isDirty = flag;
    if (flag) {
      let parent = this.parent;
      if (parent && !parent.isDirty) {
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
      indexes = this.getBoundBoxIndex(shape);
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
        this[_splitMesh]();
      }
      for (i = 0; i < this.shapes.length; i++) {
        indexes = this.getBoundBoxIndex(this.shapes[i]);
        for (let k = 0; k < indexes.length; k++) {
          this.children[indexes[k]].append(this.shapes[i]);
        }
      }
      this.shapes = [];
    } else {
      shape.bindMeshes(this);
    }
  }

  /**
   * @param  {} shape
   */
  retrieve(shape) {
    const indexes = this.getBoundBoxIndex(shape);

    let returnShapes = this.shapes;

    if (this.children.length) {
      for (let i = 0; i < indexes.length; i++) {
        returnShapes = returnShapes.concat(
          this.children[indexes[i]].retrieve(shape)
        );
      }
    }

    // TODO: 优化查找算法
    returnShapes = returnShapes.filter(function (item, index) {
      return returnShapes.indexOf(item) >= index;
    });

    return returnShapes;
  }

  [_createAxis](x, y, subWidth, subHeight) {
    return [
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
  }

  [_splitMesh]() {
    let nextLevel = this.level + 1;
    const { x, y, width, height } = this.bounds;
    let subWidth = width / 2;
    let subHeight = height / 2;

    const axis = this[_createAxis](x, y, subWidth, subHeight);

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
  getBoundBoxIndex(shape) {
    const { pos, size } = shape.attrs;
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
