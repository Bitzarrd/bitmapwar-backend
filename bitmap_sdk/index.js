import pako from "pako";

export function generate2DArray(width, height) {
    let array = new Array(height);

    for (let i = 0; i < height; i++) {
        array[i] = new Uint8Array(width);
    }

    return array;
}

export function generate2DArrayFull(width, height) {
    let array = new Array(height);

    for (let i = 0; i < height; i++) {
        array[i] = new Uint8Array(width);

        for (let j = 0; j < width; j++) {
            array[i][j] = Math.floor(Math.random() * 256); // 生成 0 到 255 之间的随机整数
        }
    }

    return array;
}

export function uint8ArrayToBase64(uint8Array) {
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binaryString);
}

export function base64ToUint8Array(base64) {
    const binaryString = window.atob(base64);
    const length = binaryString.length;
    const uint8Array = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }

    return uint8Array;
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

    //顺时针
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
    //逆时针
    // for (let i = 1; i <= radius; i++) {
    //     // 上边
    //     for (let j = -i; j <= i; j++) {
    //         coordinates.push([x - i, y + j]);
    //     }
    //
    //     // 右边
    //     for (let j = -i + 1; j <= i; j++) {
    //         coordinates.push([x + j, y + i]);
    //     }
    //
    //     // 下边
    //     for (let j = -i + 1; j <= i; j++) {
    //         coordinates.push([x + i, y - j]);
    //     }
    //
    //     // 左边
    //     for (let j = -i + 1; j < i; j++) {
    //         coordinates.push([x - j, y - i]);
    //     }
    // }


    return coordinates;
}

export function drawCell(ctx, cellSize, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    ctx.strokeStyle = 'rgb(128, 128, 128)';
    ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

export function renderGrid(ctx, gridWidth, gridHeight, cellSize, grid, players) {
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            if (grid[i][j] !== 0) {
                let player_index = grid[i][j];
                drawCell(ctx, cellSize, i, j, players[player_index - 1].color);
            }
        }
    }
}

export function updateCell(x, y, color) {
    grid[x][y] = color;
    drawCell(x, y, color);
}

export function runTurn(player, grid, circle) {
    if (player.i <= circle.length) {
        let cell = circle[player.i];
        if (!cell) {
            return;
        }
        let x = player.x + cell[0];
        let y = player.y + cell[1];
        while (!isCoordinateInArray(grid, x, y)) {
            player.i++;
            let cell = circle[player.i];
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

export function compress(grid) {
    let str = "";
    for (let i = 0; i < grid.length; i++) {
        const raw = uint8ArrayToBase64(grid[i]);
        str += raw + "\n";
    }
    console.log(str.length)
    return str;
}

export function compress2(grid) {
    let str = "";
    for (let i = 0; i < grid.length; i++) {
        const raw = uint8ArrayToBase64(pako.deflate(grid[i]));
        str += raw + "\n";
    }
    // console.log(str.length)
    return str
}

export function decompress2(str) {
    const lines = str.trim().split("\n");
    const grid = [];

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const compressed = base64ToUint8Array(raw);
        const decompressed = pako.inflate(compressed);
        grid.push(decompressed);
    }

    return grid;
}
