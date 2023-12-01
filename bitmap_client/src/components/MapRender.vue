<script>
import {drawGrid, generate2DArray, runTurn, getCircleCoordinates, drawCell, renderGrid} from "bitmap_sdk";
import {mapState} from "vuex";
import {ElMessage} from "element-plus";

export default {
  name: "MapRender",
  computed: {
    ...mapState(['game_started', 'new_player', 'new_update', 'loading', 'players', 'grid']),

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
    },
    loading(newValue, oldValue) {
      if (newValue === false) {
        console.log("render");
        renderGrid(this.ctx, this.gridWidth, this.gridHeight, this.cellSize, this.grid, this.players);
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

      scaleValue: 1, // 初始缩放比例为0.5
      left: 0,
      top: 0,
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
    innerStyle() {
      let offsetY = this.top;
      let offsetX = this.left;
      let scale = this.scaleValue;
      let result = `translate: ${offsetX}px  ${offsetY}px; scale: ${scale};`;
      return result;
    },
    init() {


      this.canvas.width = this.cellSize * this.gridWidth;
      this.canvas.height = this.cellSize * this.gridHeight;

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


      const innerContainer = document.querySelector('.inner');

      innerContainer.addEventListener('mousedown', (event) => {
        event.preventDefault();

        const initialX = event.clientX;
        const initialY = event.clientY;
        const that = this;

        document.addEventListener('mousemove', moveContainer);
        document.addEventListener('mouseup', removeListeners);

        function moveContainer(event) {
          const offsetX = event.clientX - initialX;
          const offsetY = event.clientY - initialY;
          that.top = offsetY;
          that.left = offsetX;
        }

        function removeListeners() {
          document.removeEventListener('mousemove', moveContainer);
          document.removeEventListener('mouseup', removeListeners);
        }
      });

    }
  }
}
</script>

<template>
  <div class="outer" v-loading="loading">
    <div class="inner" :style="innerStyle()">
      <!-- 内部内容 -->
      <canvas id="gridCanvas"></canvas>
    </div>
  </div>
</template>

<style scoped>


.outer {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.inner {
//width: 300px; //height: 300px; position: absolute; top: -50px; left: -50px; background-color: #f1f1f1; cursor: move;
}


canvas {
  background-color: darkgray;
//width: 100%; //height: 100%;
}
</style>