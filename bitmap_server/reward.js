import WebSocket from 'ws';

const TOP_1 = 15;
const TOP_2 = 10;
const TOP_3 = 8;
const TOP_4 = 6;
const TOP_5 = 6;
const TOP_n = 50;
const TOP_ALL = TOP_n + TOP_5 + TOP_4 + TOP_3 + TOP_2 + TOP_1;
const BITMAP_OWNER = 3;
const DEVELOPER = 2;

//计算获胜阵营
export function get_win_team(players) {
    let red = 0;
    let blue = 0;
    let green = 0;
    let purple = 0;
    for (let i = 0; i < players.length; i++) {
        if (players[i].land >= 0) {
            switch (players[i].color) {
                case 'red':
                    red++;
                    break;
                case 'blue':
                    blue++;
                    break;
                case 'green':
                    green++;
                    break;
                case 'purple':
                    purple++;
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
    return rank[0].color;
}

//获取排序后的获胜阵营的玩家列表
export function get_users_by_color(color, users) {
    let users_by_color = [];

    for (let owner of Object.keys(users)) {
        let user = users[owner];
        if (user.statistics.color === color) {
            users_by_color.push(user);
        }
    }
    let sort = users_by_color.sort((a, b) => {
        return b.statistics.land - a.statistics.land;
    });

    //标记名次
    sort.forEach((user, index) => {
        user.rank = index + 1;
    });

    return sort;
}

export function get_reward(users) {
    if (users.length === 1) {
        return TOP_1 + TOP_2 + TOP_3 + TOP_4 + TOP_5;
    }
}


export function get_users(players) {
    let users = [];
    let i = 0;
    players.forEach((player) => {
        if (users.hasOwnProperty(player.owner)) {
            users[player.owner].statistics.land += player.land;
            users[player.owner].statistics.virus += player.virus;
            users[player.owner].statistics.loss += player.loss;
            users[player.owner].bitmaps.push(player.bitmap);
            users[player.owner].init_virus += player.init_virus;
        } else {
            users[player.owner] = {
                // conn: player.conn,
                i: ++i,
                owner: player.owner,
                statistics: {land: player.land, virus: player.virus, loss: player.loss, color: player.color},
                bitmaps: [player.bitmap],
                reward_1: 0,
                reward_2: 0,
                reward_3: 0,
                init_virus: player.init_virus,
            };
        }
    });

    return users;
}

//计算每个用户的奖励
export function calculate_pool_1(users) {
    for (let owner of Object.keys(users)) {
        let user = users[owner];
        if (user.rank === 1) {
            user.reward_1 = TOP_1;
        }
        if (user.rank === 2) {
            user.reward_1 = TOP_2;
        }
        if (user.rank === 3) {
            user.reward_1 = TOP_3;
        }
        if (user.rank === 4) {
            user.reward_1 = TOP_4;
        }
        if (user.rank === 5) {
            user.reward_1 = TOP_5;
        }
    }

}

export function calculate_pool_2(users) {
    let proportion = calculate_pool_2_proportion(users);
    for (let owner of Object.keys(users)) {
        let user = users[owner];
        user.reward_2 = proportion / users.length;
    }
}

//计算2号奖池比例
export function calculate_pool_2_proportion(users) {
    let user_amount = users.length;
    if (user_amount === 1) {
        return TOP_ALL - TOP_1;
    }
    if (user_amount === 2) {
        return TOP_ALL - TOP_1 - TOP_2;
    }
    if (user_amount === 3) {
        return TOP_ALL - TOP_1 - TOP_2 - TOP_3;
    }
    if (user_amount === 4) {
        return TOP_ALL - TOP_1 - TOP_2 - TOP_3 - TOP_4;
    }
    if (user_amount === 5) {
        return TOP_ALL - TOP_1 - TOP_2 - TOP_3 - TOP_4 - TOP_5;
    }
    return TOP_ALL - TOP_1 - TOP_2 - TOP_3 - TOP_4 - TOP_5;
}

export function calculate_bitmap_total_amount(users) {
    let total = 0;
    for (let owner of Object.keys(users)) {
        let user = users[owner];
        total += user.bitmaps.length;
    }
    return total;
}

export function calculate_bitmap_reward(users) {
    let total = calculate_bitmap_total_amount(users);
    let reward = BITMAP_OWNER / total;
    for (let owner of Object.keys(users)) {
        let user = users[owner];
        user.reward_3 = user.bitmaps.length * reward;
    }
}

export function get_rank_for_save(players) {
    let rank = players.sort((a, b) => {
        return a.land > b.land;
    });

    let rand_to_save = [];
    for (let i = 0; i < rank.length; i++) {
        const owner = rank[i].owner;
        const land = rank[i].land;
        if (rand_to_save.hasOwnProperty(owner)) {
            rand_to_save[owner].land += land;
        } else {
            rand_to_save[owner] = {owner: owner, land: land};
        }
    }
    return Object.values(rand_to_save);
}

export function get_conn_by_owner(players, owner) {
    for (let i = 0; i < players.length; i++) {
        if (players[i].owner === owner) {
            if (players[i].hasOwnProperty('conn')) {
                let conn = players[i].conn;
                if (conn.readyState === WebSocket.OPEN) {
                    return conn;
                }
            }
        }
    }
}

export function get_all_init_virus(players) {
    let virus = 0;
    for (let i = 0; i < players.length; i++) {
        virus += players[i].init_virus;
    }
    return virus;
}

export function calculate_virus_to_profit(virus) {
    //todo 金额待确定
    return BigInt(virus) * BigInt(10000000000000);
}

export function get_color_by_owner(owner, players) {
    for (let i = 0; i < players.length; i++) {
        if (players[i].owner === owner) {
            return players[i].color;
        }
    }
}

// 红：50%根据投入bit的数量进行分配
export function get_total_init_virus(users) {
    let total = 0;
    for (let owner of Object.keys(users)) {
        let user = users[owner];
        total += user[i].init_virus;
    }
    return total;
}

export function calculate_pool_2_red(users) {
    let proportion = calculate_pool_2_proportion(users);
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

export function calculate_pool_2_green(users) {
    let proportion = calculate_pool_2_proportion(users);
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

export function calculate_pool_2_blue(users) {
    let proportion = calculate_pool_2_proportion(users);
    let total_loss = get_total_loss(users);
    if (total_loss === 0) {
        return calculate_pool_2(users);
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
export function calculate_pool_2_purple_base(users) {
    let proportion = calculate_pool_2_proportion(users);
    return proportion / users.length;
}

export function calculate_pool_2_purple(users) {
    let base = calculate_pool_2_purple_base(users);
    for (let owner of Object.keys(users)) {
        let user = users[owner];
        let coefficient = (1 - (user.i - 1) / 100);
        user.reward_2 = base * coefficient;
    }
}

export function calculate_pool_2_by_color(users, color) {
    switch (color) {
        case "red":
            return calculate_pool_2_red(users);
        case "green":
            return calculate_pool_2_green(users);
        case "blue":
            return calculate_pool_2_blue(users);
        case "purple":
            return calculate_pool_2_purple(users);
    }
}