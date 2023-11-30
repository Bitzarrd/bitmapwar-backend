<script>
import {drawGrid, generate2DArray, runTurn, getCircleCoordinates, drawCell} from "bitmap_sdk";
import {mapState} from "vuex";
import {ElMessage} from "element-plus";

export default {
  name: "MapRender",
  computed: {
    ...mapState(['game_started', 'new_player', 'new_update']),

  },
  watch: {
    game_started(newValue, oldValue) {
      // Perform actions based on the changes in myProperty
      console.log('MapRender watch game_started:', newValue);
      if (newValue == true) {
        this.init();

      }
    },
    new_player(newValue, oldValue) {
      drawCell(this.ctx, this.cellSize, newValue.x, newValue.y, newValue.color);
      ElMessage({
        message: "new player joined at " + newValue.x + ":" + newValue.y,
        type: 'success',
      })
    },
    new_update(newValue, oldValue) {
      for (let i = 0; i < newValue.length; i++) {
        let cellValue = newValue[i];
        drawCell(this.ctx, this.cellSize, cellValue.x, cellValue.y, cellValue.color);
      }
    }
  },
  data() {
    return {
      gridWidth: 300,
      gridHeight: 300,
      cellSize: 10,
      isDragging: false,
      mouseOffsetX: 0,
      mouseOffsetY: 0,
      canvas: null,
      ctx: null,
      scaleValue: 1 // 初始缩放比例为0.5
      // players: [
      //   {
      //     i: 0,
      //     x: 5,
      //     y: 5,
      //     color: 'blue',
      //     circle: getCircleCoordinates(500)
      //   },
      //   {
      //     i: 0,
      //     x: 50,
      //     y: 50,
      //     color: 'red',
      //     circle: getCircleCoordinates(500)
      //   }, {
      //     i: 0,
      //     x: 80,
      //     y: 80,
      //     color: 'yellow',
      //     circle: getCircleCoordinates(500)
      //   }
      // ]
    }
  },

  mounted() {
    this.canvas = document.getElementById('gridCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.init();
  },
  created() {

  },
  methods: {
    scaledStyle() {
      console.log(`transform: scale(${this.scaleValue})`);
      return `transform: scale(${this.scaleValue})`;
    },
    startDragging(e) {
      this.isDragging = true;
      this.mouseOffsetX = e.offsetX;
      this.mouseOffsetY = e.offsetY;
    },

    stopDragging() {
      this.isDragging = false;
    },

    drag(e) {
      if (this.isDragging) {
        const innerDiv = document.querySelector(".inner");

        const newX = e.clientX - this.mouseOffsetX;
        const newY = e.clientY - this.mouseOffsetY;
        innerDiv.style.left = `${newX}px`;
        innerDiv.style.top = `${newY}px`;
      }
    },
    init() {


      this.canvas.width = this.cellSize * this.gridWidth;
      this.canvas.height = this.cellSize * this.gridHeight;

      let grid = generate2DArray(this.gridWidth, this.gridHeight);

      // console.log(grid);

      // setInterval(() => {
      //   this.players.forEach(player => {
      //     let {x, y} = runTurn(player, grid);
      //     grid[x][y] = player.color;
      //     drawCell(ctx, cellSize, x, y, player.color);
      //   });
      // }, 10);

      drawGrid(this.canvas, this.ctx, this.gridWidth, this.gridHeight, this.cellSize);

      // 添加鼠标滚轮事件监听器
      this.canvas.addEventListener('wheel', () => {
        event.preventDefault();
        const delta = event.deltaY;
        const scaleFactor = 1; // 缩放因子
        const scaleMultiplier = delta > 0 ? 1 - scaleFactor : 1 + scaleFactor;
        if (scaleMultiplier === 0) {
          this.scaleValue -= 0.1;
        }

        if (scaleMultiplier === 2) {
          this.scaleValue += 0.1;
        }

        if (this.scaleValue < 0.5) {
          this.scaleValue = 0.5;
        }
        if (this.scaleValue > 2) {
          this.scaleValue = 2;
        }
      });

      // 缩放函数

      const innerDiv = document.querySelector(".inner");
      innerDiv.addEventListener("mousedown", this.startDragging);
      innerDiv.addEventListener("mouseup", this.stopDragging);
      innerDiv.addEventListener("mousemove", this.drag);

    }
  }
}
</script>

<template>
  <div class="outer">
    <div class="inner" :style="scaledStyle()">
      <!-- 内部内容 -->
      <canvas id="gridCanvas"></canvas>
    </div>
  </div>
</template>

<style scoped>
.outer {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* 超出部分裁剪 */
}

.inner {
  position: absolute;
//width: 300px; /* 内部 div 比外部大 */ //height: 300px; background-color: #f0f0f0;
}

/* 鼠标移动时改变内部 div 的位置 */
.inner:hover {
  cursor: move;
}

canvas {
  background-color: darkgray;
//width: 100%; //height: 100%;
}
</style>