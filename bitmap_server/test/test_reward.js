import winston from "winston";
import {
    get_users,
    get_win_team,
    get_users_by_color,
    calculate_pool_2_proportion,
    calculate_pool_1,
    calculate_pool_2,
    calculate_bitmap_reward, calculate_pool_2_by_color
} from "../reward.js";

const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.simple(),
    ),
    level: "debug",
});

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
        init_virus: 1,
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
        init_virus: 2,
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
        init_virus: 3,
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
        init_virus: 4,
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
        init_virus: 4,
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

logger.info("地块信息：")
for (let player of players) {
    logger.info("地图：" + player.bitmap + " 用户：" + player.owner + " 颜色：" + player.color + " 领地：" + player.land + " 病毒：" + player.virus + " 损失：" + player.loss);
}

const pool_2 = calculate_pool_2_proportion(win_team_users);
logger.info("奖池2的比例为：" + pool_2);
logger.info("胜利方用户分别是:")
calculate_pool_1(win_team_users);
calculate_pool_2_by_color(win_team_users, win_team);
for (let user of win_team_users) {
    logger.info("用户：" + user.owner + " 名次：" + user.rank + " 颜色：" + user.statistics.color + " 领地：" + user.statistics.land + " 病毒：" + user.statistics.virus + " 损失：" + user.statistics.loss + " 奖励：" + user.reward_1 + "," + user.reward_2 + "");
}
logger.info("BITMAP持有者奖励为：")
calculate_bitmap_reward(users);
for (let owner of Object.keys(users)) {
    let user = users[owner];
    logger.info("用户：" + user.owner + " 颜色：" + user.statistics.color + " 持有地图：[" + user.bitmaps + "] 奖励为：" + user.reward_3)
}
// console.log(users);