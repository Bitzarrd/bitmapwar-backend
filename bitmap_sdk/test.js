import sizeof from "sizeof";
import {getCircleCoordinates} from "./index.js";


export function getCircleCoordinatesInt8(radius) {
    const coordinates = [
        new Int8Array([0, 0]),
    ];
    let x = 0;
    let y = 0;

    //顺时针
    for (let i = 1; i <= radius; i++) {
        // 上边
        for (let j = -i; j <= i; j++) {
            coordinates.push(new Int8Array([x - i, y + j]));
        }

        // 右边
        for (let j = -i + 1; j <= i; j++) {
            coordinates.push(new Int8Array([x + j, y + i]));
        }

        // 下边
        for (let j = -i + 1; j <= i; j++) {
            coordinates.push(new Int8Array([x + i, y - j]));
        }

        // 左边
        for (let j = -i + 1; j < i; j++) {
            coordinates.push(new Int8Array([x - j, y - i]));
        }
    }

    return coordinates;
}

let a = getCircleCoordinatesInt8(100);
//todo 打印啊的内存占用
const memoryUsage = sizeof.sizeof(a);
console.log(`Memory Usage: ${memoryUsage} bytes`);

let b = getCircleCoordinates(100);
const memoryUsageb = sizeof.sizeof(b);
console.log(`Memory Usage: ${memoryUsageb} bytes`);