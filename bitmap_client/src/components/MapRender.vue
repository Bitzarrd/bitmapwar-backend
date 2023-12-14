<script>
import {drawGrid, isCoordinateInArray, drawCell, renderGrid} from "bitmap_sdk";
import {mapState} from "vuex";
import {ElMessage} from "element-plus";
import Vue3DraggableResizable from "vue3-draggable-resizable";
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'

export function clearCell(ctx, cellSize, x, y) {
  // 清除指定位置的矩形区域
  console.log("clearCell", x, y);
  ctx.clearRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

export function clearAll(ctx) {
  console.log("Clear All");
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export default {
  name: "MapRender",
  components: {Vue3DraggableResizable},
  computed: {
    ...mapState([
      'game_started', 'new_player', 'new_update', 'loading', 'players', 'grid',
      'gridWidth', 'gridHeight', 'cellSize'
    ]),

  },
  watch: {
    game_started(newValue, oldValue) {
      // Perform actions based on the changes in myProperty
      console.log('MapRender watch game_started:', newValue);
      if (newValue > 0) {
        clearAll(this.ctx);
        this.init();
        for (let player of this.players) {
          drawCell(this.ctx, this.cellSize, player.x, player.y, player.color);
        }
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
        // console.log("render",this.ctx, this.gridWidth, this.gridHeight, this.cellSize, this.grid, this.players);
        this.canvas.width = this.cellSize * this.gridWidth;
        this.canvas.height = this.cellSize * this.gridHeight;
        console.log("init", this.canvas, this.ctx, this.gridWidth, this.gridHeight, this.cellSize)
        drawGrid(this.canvas, this.ctx, this.gridWidth, this.gridHeight, this.cellSize);
        renderGrid(this.ctx, this.gridWidth, this.gridHeight, this.cellSize, this.grid, this.players);
      }
    }
  },
  data() {
    return {
      isDragging: false,
      mouseOffsetX: 0,
      mouseOffsetY: 0,
      canvas: null,
      ctx: null,
      left: 0,
      top: 0,
      x: 0,
      y: 0,
      h: 0,
      w: 0,
      pointer: null,
    }
  },

  mounted() {
    this.canvas = document.getElementById('gridCanvas');
    this.ctx = this.canvas.getContext('2d');

    // drawGrid(this.canvas, this.ctx, this.gridWidth, this.gridHeight, this.cellSize);

    this.init();
  },
  created() {

  },
  methods: {
    init() {
      this.canvas.width = this.cellSize * this.gridWidth;
      this.canvas.height = this.cellSize * this.gridHeight;
      drawGrid(this.canvas, this.ctx, this.gridWidth, this.gridHeight, this.cellSize);
    },
    search(middle_width, middle_height, searched_map) {
      let y = Math.floor(searched_map / this.gridWidth);
      let x = searched_map % this.gridWidth;

      if (this.pointer !== null) {
        clearCell(this.ctx, this.cellSize, this.pointer.x, this.pointer.y);
      }

      if (isCoordinateInArray(this.grid, x, y)) {
        let top = -(y * 10);
        let left = -(x * 10);
        console.log(x, y, left, top);
        this.y = top + (middle_height / 2);
        this.x = left + (middle_width / 2);
        drawCell(this.ctx, this.cellSize, x, y, "black");
        this.pointer = {x: x, y: y};
      }


    },
    clear() {
      clearAll(this.ctx)
    }
  }
}
</script>

<template>


  <Vue3DraggableResizable
      :initW="gridWidth*cellSize"
      :initH="gridHeight*cellSize"
      :resizable="false"
      v-model:x="x"
      v-model:y="y"
      v-model:w="w"
      v-model:h="h"
  >
    <el-button @click="clear">Clear</el-button>

    <canvas id="gridCanvas"
    ></canvas>

  </Vue3DraggableResizable>

  <!--  <div style="float: right">-->
  <!--    <el-input-number v-model="x"/>-->
  <!--    <el-input-number v-model="y"/>-->
  <!--  </div>-->

</template>

<style scoped>


canvas {
  background-color: orange;
}

</style>