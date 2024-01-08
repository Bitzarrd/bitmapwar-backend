// import {generate2DArray, generate2DArrayFull, uint8ArrayToBase64} from "./index.js";
// import pako from "pako";
//

import {merge2DArray, generate2DArray, compress2, compress3, decompress3,compress4, decompress4, generate2DArrayFull} from "./index.js";

let width = 1000;
let height = 1000;
let grid = generate2DArray(width, height);
grid[817][719] = 1;
// let zip2 = compress2(grid);

let zip3 = compress4(grid);
// console.log(zip2);
console.log(zip3.length);

let grid3 = decompress4(zip3, width, height);
console.log(grid3[817][719]);
//console.log(grid3);
// // console.log(grid);
//
// // console.log(pako)
//
//
// compress();
// compress2()