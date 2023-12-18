
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
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

export function calculate_virus_to_profit(virus) {
    //todo 金额待确定
    return BigInt(virus) * BigInt(10000000000000);
}
