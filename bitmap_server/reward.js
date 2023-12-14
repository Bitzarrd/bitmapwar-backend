import winston from "winston";

const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.simple(),
    ),
    level: "debug",
});

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
                bitmaps: [player.bitmap]
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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const players = [
    {
        i: 0,
        x: 0,
        y: 0,
        color: 'red',
        land: 1,
        loss: 0,
        virus: 1,
        bitmap: 1234,
        owner: "0xD890150Dc85452eA558a13F3A978E6D150237D21",
    },
    {
        i: 0,
        x: 0,
        y: 0,
        color: 'blue',
        land: 2,
        loss: 0,
        virus: 2,
        bitmap: 1235,
        owner: "0xD890150Dc85452eA558a13F3A978E6D150237D22",
    },
    {
        i: 0,
        x: 0,
        y: 0,
        color: 'blue',
        land: 3,
        loss: 0,
        virus: 3,
        bitmap: 1236,
        owner: "0xD890150Dc85452eA558a13F3A978E6D150237D23",
    },
    {
        i: 0,
        x: 0,
        y: 0,
        color: 'blue',
        land: 4,
        loss: 0,
        virus: 4,
        bitmap: 1237,
        owner: "0xD890150Dc85452eA558a13F3A978E6D150237D24",
    },
    {
        i: 0,
        x: 0,
        y: 0,
        color: 'blue',
        land: 4,
        loss: 0,
        virus: 4,
        bitmap: 1238,
        owner: "0xD890150Dc85452eA558a13F3A978E6D150237D24",
    }
]

const users = get_users(players);
// console.log(users);
//
const win_team = get_win_team(players);
logger.info("当前胜利的队伍是：" + win_team);
//
const win_team_users = get_users_by_color(win_team, users);

// console.log(win_team_users);


const pool_2 = calculate_pool_2_proportion(win_team_users);
logger.info("奖池2的比例为：" + pool_2);
logger.info("胜利方用户分别是:")
calculate_pool_1(win_team_users);
calculate_pool_2(win_team_users);
for (let user of win_team_users) {
    logger.info("用户：" + user.owner + " 名次：" + user.rank + " 颜色：" + user.statistics.color + " 领地：" + user.statistics.land + " 病毒：" + user.statistics.virus + " 损失：" + user.statistics.loss + " 奖励：" + user.reward_1 + "," + user.reward_2 + "");
}
logger.info("BITMAP持有者奖励为：")

for (let owner of Object.keys(users)) {
    let user = users[owner];
    logger.info("用户：" + user.owner + " 颜色：" + user.statistics.color + " 持有地图：[" + user.bitmaps + "] 奖励为：")
}
// console.log(users);