import {getCircleCoordinates} from "bitmap_sdk";
import fs from 'fs';

// 生成二维数组
const twoDimensionalArray = getCircleCoordinates(500)

// 将数组转换为字符串
const arrayString = JSON.stringify(twoDimensionalArray);

// 生成要保存到文件中的 JavaScript 代码
const fileContent = `export const circle = ${arrayString};`;

// 指定保存的文件路径和文件名
const filePath = '../circle.js';

// 将数据写入文件
fs.writeFile(filePath, fileContent, (err) => {
    if (err) {
        console.error('保存文件时出错：', err);
    } else {
        console.log(`二维数组已成功保存到文件：${filePath}`);
    }
});