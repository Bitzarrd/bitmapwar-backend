export function shortend(address) {
    if(!address){
        return "";
    }
    if(address.length<5){
        return address;
    }
    return address.substr(0, 5) + '...' + address.substr(address.length - 5, address.length);
}


export function calculateCanvasPosition(gridWidth, gridHeight, cellSize, point) {
    // 计算实际宽度和高度
    var actualWidth = gridWidth * cellSize;
    var actualHeight = gridHeight * cellSize;

    // 计算left和top值
    var left = point.x - actualWidth / 2;
    var top = point.y - actualHeight / 2;

    // 返回left和top值
    return { left: left, top: top };
}