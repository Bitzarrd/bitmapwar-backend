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
    let yellow = 0;
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
                case 'yellow':
                    yellow++;
                    break;
            }
        }
    }
    return red > blue ? (red > green ? (red > yellow ? 'red' : 'yellow') : (green > yellow ? 'green' : 'yellow')) : (blue > green ? (blue > yellow ? 'blue' : 'yellow') : (green > yellow ? 'green' : 'yellow'));
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
    players.forEach((player) => {
        if (users.hasOwnProperty(player.owner)) {
            users[player.owner].statistics.land += player.land;
            users[player.owner].statistics.virus += player.virus;
            users[player.owner].statistics.loss += player.loss;
            users[player.owner].bitmaps.push(player.bitmap);
        } else {
            users[player.owner] = {
                // conn: player.conn,
                owner: player.owner,
                statistics: {land: player.land, virus: player.virus, loss: player.loss, color: player.color},
                bitmaps: [player.bitmap],
                reward_1: 0,
                reward_2: 0,
                reward_3: 0,
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
        rand_to_save.push({
            owner: rank[i].owner,
            land: rank[i].land
        })
    }
    return rand_to_save;
}

export function get_conn_by_owner(players, owner) {
    for (let i = 0; i < players.length; i++) {
        if (players[i].owner === owner) {
            let conn = players[i].conn;
            if (conn.readyState === WebSocket.OPEN) {
                return conn;
            }
        }
    }
}