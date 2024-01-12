import {
    calculate_pool_2, calculate_pool_2_proportion,
    get_total_init_virus
} from "./reward.js";

export function sort_win_team(players) {
    let red = 0;
    let blue = 0;
    let green = 0;
    let purple = 0;
    for (let i = 0; i < players.length; i++) {
        if (players[i].land >= 0) {
            switch (players[i].color) {
                case 'red':
                    red += players[i].land;
                    break;
                case 'blue':
                    blue += players[i].land;
                    break;
                case 'green':
                    green += players[i].land;
                    break;
                case 'purple':
                    purple += players[i].land;
                    break;
            }
        }
    }
    let rank = [
        {color: "red", land: red},
        {color: "blue", land: blue},
        {color: "green", land: green},
        {color: "purple", land: purple},
    ];
    rank.sort((a, b) => {
        return b.land - a.land;
    });
    return rank;
}

export function calculate_pool_red(users, proportion) {
    let total_init_virus = get_total_init_virus(users);
    for (let owner of Object.keys(users)) {
        let user = users[owner];
        user.reward_2 = proportion * (user.init_virus / total_init_virus);
    }
}


// 绿：50%根据持有bitmap地块数量进行分配
export function get_total_bitmap(users) {
    let bitmaps = [];
    for (let owner of Object.keys(users)) {
        let user = users[owner];
        bitmaps = bitmaps.concat(user.bitmaps);
    }
    return bitmaps;
}

export function calculate_pool_green(users, proportion) {
    let total_bitmaps = get_total_bitmap(users);
    for (let owner of Object.keys(users)) {
        let user = users[owner];
        user.reward_2 = proportion * (user.bitmaps.length / total_bitmaps.length);
    }
}

// 蓝：50%根据损失的bit数量进行分配
export function get_total_loss(users) {
    let total = 0;
    for (let owner of Object.keys(users)) {
        let user = users[owner];
        total += user.statistics.loss;
    }
    return total;
}


export function calculate_pool(users, proportion) {
    for (let owner of Object.keys(users)) {
        let user = users[owner];
        user.reward_2 = proportion / users.length;
    }
}

export function calculate_pool_blue(users, proportion) {
    let total_loss = get_total_loss(users);
    if (total_loss === 0) {
        return calculate_pool(users, proportion);
    }
    for (let owner of Object.keys(users)) {
        let user = users[owner];
        user.reward_2 = proportion * (user.statistics.loss / total_loss);
    }
}

// 紫：
// 基础奖金=奖金/人数
// 获奖系数=1 - (玩家序号 - 1) / 100
// 奖金=基础奖金* 获奖系数）
export function calculate_pool_purple_base(users, proportion) {
    return proportion / users.length;
}

export function calculate_pool_purple(users, proportion) {
    let base = calculate_pool_purple_base(users, proportion);
    for (let owner of Object.keys(users)) {
        let user = users[owner];
        let coefficient = (1 - (user.i - 1) / 100);
        user.reward_2 = base * coefficient;
    }
}

export function calculate_pool_by_color(users, color, proportion) {
    switch (color) {
        case "red":
            return calculate_pool_red(users, proportion);
        case "green":
            return calculate_pool_green(users, proportion);
        case "blue":
            return calculate_pool_blue(users, proportion);
        case "purple":
            return calculate_pool_purple(users, proportion);
    }
}


export function calculate_proportion(user1, user2, user3) {
    if (user1.length !== 0 && user2.length === 0 && user3.length === 0) {
        return [88, 0, 0];
    }
    if (user1.length !== 0 && user2.length !== 0 && user3.length === 0) {
        return [60, 28, 0];
    }
    if (user1.length !== 0 && user2.length !== 0 && user3.length !== 0) {
        return [60, 20, 8];
    }
    return [0, 0, 0];
}