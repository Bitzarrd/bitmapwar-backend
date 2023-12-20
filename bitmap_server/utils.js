export function getRandomInt(min, max) {
    min = Math.ceil(min); // 向上取整，确保范围内的最小值为整数
    max = Math.floor(max); // 向下取整，确保范围内的最大值为整数
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function now() {
    const timestampSeconds = Math.floor(new Date().getTime() / 1000);
    return timestampSeconds;
}

export function simple_player(player) {
    return {
        i: player.i,
        x: player.x,
        y: player.y,
        bitmap: player.bitmap,
        color: player.color,
        land: player.land,
        loss: player.loss,
        init_virus: player.virus,
        virus: player.virus,
        owner: player.owner,
    }
}

export function simple_players(players) {
    let result = [];
    for (let player of players) {
        result.push(simple_player(player))
    }

    return result;
}

export function isToday(timestamp) {
    const today = new Date();
    const date = new Date(timestamp * 1000);
    return today.toDateString() === date.toDateString();
}