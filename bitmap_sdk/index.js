export function generate2DArray(width, height) {
    let array = [];

    for (let i = 0; i < height; i++) {
        let row = [];

        for (let j = 0; j < width; j++) {
            row.push(0); // 这里可以设置初始值，这里使用0作为示例
        }

        array.push(row);
    }

    return array;
}

export function isCoordinateInArray(array, x, y) {
    if (x < 0 || y < 0 || x >= array.length || y >= array[0].length) {
        return false;
    }

    return true;
}

export function getCircleCoordinates(radius) {
    const coordinates = [];
    let x = 0;
    let y = 0;

    for (let i = 1; i <= radius; i++) {
        // 上边
        for (let j = -i; j <= i; j++) {
            coordinates.push([x - i, y + j]);
        }

        // 右边
        for (let j = -i + 1; j <= i; j++) {
            coordinates.push([x + j, y + i]);
        }

        // 下边
        for (let j = -i + 1; j <= i; j++) {
            coordinates.push([x + i, y - j]);
        }

        // 左边
        for (let j = -i + 1; j < i; j++) {
            coordinates.push([x - j, y - i]);
        }
    }

    return coordinates;
}

export function drawCell(ctx, cellSize, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    ctx.strokeStyle = 'rgb(128, 128, 128)';
    ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

export function renderGrid() {
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            const cellColor = grid[i][j] === 0 ? 'gery' : grid[i][j];
            drawCell(i, j, cellColor);
        }
    }
}

export function updateCell(x, y, color) {
    grid[x][y] = color;
    drawCell(x, y, color);
}

export function runTurn(player, grid) {
    if (player.i <= player.circle.length) {
        let cell = player.circle[player.i];
        if (!cell) {
            return;
        }
        let x = player.x + cell[0];
        let y = player.y + cell[1];
        while (!isCoordinateInArray(grid, x, y)) {
            player.i++;
            let cell = player.circle[player.i];
            x = player.x + cell[0];
            y = player.y + cell[1];
        }
        player.i++;
        // updateCell(x, y, player.color);

        return {x: x, y: y}
    }
}

export function drawHorizontalLine(canvas, ctx, y) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
}

export function drawVerticalLine(canvas, ctx, x) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
}

export function drawGrid(canvas, ctx, gridWidth, gridHeight, cellSize) {
    for (let i = 0; i < gridHeight; i++) {
        drawHorizontalLine(canvas, ctx, i * cellSize);
    }

    for (let j = 0; j < gridWidth; j++) {
        drawVerticalLine(canvas, ctx, j * cellSize);
    }
}
