<script>
import {drawGrid, generate2DArray, run, getCircleCoordinates, drawCell} from "bitmap_sdk";

export default {
  name: "MapRender",
  mounted() {
    const canvas = document.getElementById('gridCanvas');
    const ctx = canvas.getContext('2d');
    const cellSize = 4;
    const gridWidth = 100;
    const gridHeight = 100;

    canvas.width = cellSize * gridWidth;
    canvas.height = cellSize * gridHeight;

    let grid = generate2DArray(gridWidth, gridHeight);

    console.log(grid);
    let players = [{
      i: 0,
      x: 5,
      y: 5,
      color: 'blue',
      circle: getCircleCoordinates(gridWidth, gridHeight, 5, 5)
    },
      {
        i: 0,
        x: 50,
        y: 50,
        color: 'red',
        circle: getCircleCoordinates(gridWidth, gridHeight, 50, 50)
      }, {
        i: 0,
        x: 80,
        y: 80,
        color: 'yellow',
        circle: getCircleCoordinates(gridWidth, gridHeight, 80, 80)
      }];

    setInterval(() => {
      for (let i in players) {
        let {x, y} = run(players[i], grid);
        grid[x][y] = players[i].color;
        drawCell(ctx, cellSize, x, y, players[i].color);
      }
    }, 1000);

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
//width: 100%; //height: 100%;
}
</style>