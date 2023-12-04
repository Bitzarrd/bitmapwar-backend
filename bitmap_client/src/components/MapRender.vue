<script>
import {drawGrid, generate2DArray, runTurn, getCircleCoordinates, drawCell, renderGrid} from "bitmap_sdk";
import {mapState} from "vuex";
import {ElMessage} from "element-plus";
import Vue3DraggableResizable from "vue3-draggable-resizable";
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'

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
      if (newValue === true) {
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
      isDragging: false,
      mouseOffsetX: 0,
      mouseOffsetY: 0,
      canvas: null,
      ctx: null,
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
    init() {
      this.canvas.width = this.cellSize * this.gridWidth;
      this.canvas.height = this.cellSize * this.gridHeight;
      drawGrid(this.canvas, this.ctx, this.gridWidth, this.gridHeight, this.cellSize);
    }
  }
}
</script>

<template>

  <Vue3DraggableResizable v-loading="loading"
                          :initW="gridWidth*cellSize"
                          :initH="gridHeight*cellSize"
                          :resizable="false"
  >
    <canvas id="gridCanvas"></canvas>
  </Vue3DraggableResizable>
</template>

<style scoped>


canvas {
  background-color: orange;
}

</style>