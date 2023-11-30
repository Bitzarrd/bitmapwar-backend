<script>

import {drawGrid, generate2DArray} from "bitmap_sdk";

export default {
  name: "MapRender",
  mounted() {
    const canvas = document.getElementById('gridCanvas');
    const ctx = canvas.getContext('2d');
    const cellSize = 10;
    const gridWidth = 1000;
    const gridHeight = 1000;

    canvas.width = cellSize * gridWidth;
    canvas.height = cellSize * gridHeight;

    let grid = generate2DArray(gridWidth, gridHeight);

    drawGrid(canvas, ctx, gridWidth, gridHeight, cellSize);

  }
}
</script>

<template>
  <canvas id="gridCanvas"></canvas>
</template>

<style scoped>
canvas {
  background-color: darkgray;
  //width: 100%;
  //height: 100%;
}
</style>