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
