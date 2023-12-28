import {generate2DArray} from "bitmap_sdk";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function test() {
    const grid = generate2DArray(1000, 1000);

    const start_time = Date.now();

    for (let i = 0; i < 1000; i++) {
        for (let j = 0; j < 1000; j++) {
            grid[i][j] = 1;
            await sleep(10);
        }
    }

    const stop_time = Date.now();

    console.log(stop_time - start_time);
}

test()