import winston from "winston";
import {
    get_users,
    get_users_by_color,
} from "../reward.js";
import {calculate_pool_by_color, sort_win_team} from "../reward2.0.js";
import {isPrime} from "../utils.js";
// import {mysql_query} from "../mysql";
// import {mysql_connection} from "../main2";
import {parseEther} from "ethers";
import {getLast3User} from "../reward3.0.js";

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
        color: 'purple',
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
        color: 'purple',
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
        color: 'purple',
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
        land: 5,
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
    },
    {
        i: 0,
        x: 0,
        y: 0,
        color: 'green',
        land: 5,
        loss: 0,
        virus: 4,
        init_virus: 5,
        bitmap: 1238,
        owner: "0xD890150Dc85452eA558a13F3A978E6D150237D25",
    }
]

const users = get_users(players);
// console.log(users);
//
const win_teams = sort_win_team(players);

logger.info("地块信息：")
for (let player of players) {
    logger.info("地图：" + player.bitmap + " 用户：" + player.owner + " 颜色：" + player.color + " 领地：" + player.land + " 病毒：" + player.virus + " 损失：" + player.loss);
}

logger.info("当前的队伍名次是：");
for (let win_team of win_teams) {
    logger.info(win_team.color + " lands:" + win_team.land);
}
//
const win_team_users_1 = get_users_by_color(win_teams[0].color, users);
const win_team_users_2 = get_users_by_color(win_teams[1].color, users);
const win_team_users_3 = get_users_by_color(win_teams[2].color, users);

// console.log(win_team_users);

logger.info("对第一名的队伍进行发奖：");
calculate_pool_by_color(win_team_users_1, win_teams[0].color, 60);
for (let user of win_team_users_1) {
    logger.info("用户：" + user.owner + " 名次：" + user.rank + " 颜色：" + user.statistics.color + " 领地：" + user.statistics.land + " 病毒：" + user.statistics.virus + " 损失：" + user.statistics.loss + " 奖励：" + user.reward_2 + "%");
}

logger.info("对第二名的队伍进行发奖：");
calculate_pool_by_color(win_team_users_2, win_teams[1].color, 20);
for (let user of win_team_users_2) {
    logger.info("用户：" + user.owner + " 名次：" + user.rank + " 颜色：" + user.statistics.color + " 领地：" + user.statistics.land + " 病毒：" + user.statistics.virus + " 损失：" + user.statistics.loss + " 奖励：" + user.reward_2 + "%");
}

logger.info("对第三名的队伍进行发奖：");
calculate_pool_by_color(win_team_users_3, win_teams[2].color, 8);
for (let user of win_team_users_3) {
    logger.info("用户：" + user.owner + " 名次：" + user.rank + " 颜色：" + user.statistics.color + " 领地：" + user.statistics.land + " 病毒：" + user.statistics.virus + " 损失：" + user.statistics.loss + " 奖励：" + user.reward_2 + "%");
}


const last_3_users = getLast3User(players);
console.log("最后三名的用户：",JSON.stringify(last_3_users));

//
// logger.info("计算爆灯");
// let win_team = win_teams[0];
// logger.info(`lands:${win_team.land} isPrime:${isPrime(win_team.land)}`)
//
// let jackpot = parseEther("0.1");
// let jackpot_reward = BigInt(Math.floor((Number)(jackpot) * 0.5));
// let blue_wand_reward = BigInt(Math.floor((Number)(jackpot) * 0.2));
// logger.info("jackpot_reward:" + jackpot_reward);
// logger.info("blue_wand_reward:" + blue_wand_reward);
//
