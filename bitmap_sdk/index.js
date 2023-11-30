export function generate2DArray(width, height) {
    var array = [];

    for (var i = 0; i < height; i++) {
        var row = [];

        for (var j = 0; j < width; j++) {
            row.push(0); // 这里可以设置初始值，这里使用0作为示例
        }

        array.push(row);
    }

    return array;
}
