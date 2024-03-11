import {generate2DArray, runTurn, compress5} from 'bitmap_sdk';
import WebSocket, {WebSocketServer} from 'ws';
import winston from "winston";
import dotenv from "dotenv";
import axios from "axios";
import mysql from "mysql";
import {isPrime, isToday, now, simple_player, simple_players} from "./utils.js";
import {gridWidth, durationOfTheMatch, intervalBetweenMatches, circle, stepInterval} from "./defines.js";
import {get_events} from "./get_events.js";
import {make_signature} from "./signature.js";
import {mysql_query} from "./mysql.js";
import {
    calculate_virus_to_profit,
    get_all_init_virus,
    get_conn_by_owner2,
    get_users,
    get_users_by_color,
} from "./reward.js";
import {calculate_pool_by_color, calculate_proportion, sort_win_team} from "./reward2.0.js";
import {bitmap_errors} from "./bitmap_errors.js";
import * as fs from "fs";
import {evmAddressToMerlinAddress, pubKeyToBtcAddress, pubKeyToEVMAddress, pubKeyToTaprootAddress} from "./address.js";
import {filter_action_log} from "./action_log.js";
import {parseEther} from "ethers";

dotenv.config();

// console.log(circle);

export let mysql_connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    idleTimeoutMillis: 86400 * 100 // 设置连接在没有活动时断开
});

const myFormat = winston.format.printf(({level, message, label, timestamp}) => {
    return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    level: "debug",
    format: winston.format.combine(
        winston.format.timestamp(),
        myFormat
    ),
});


let last_rank = [];
mysql_connection.connect({}, async (err) => {
    if (err) {
        logger.error("mysql connect error" + err)
    }
    logger.info("mysql connected")

    const last_rounds = await mysql_query(mysql_connection, "SELECT * FROM `round` ORDER BY id DESC LIMIT 1;");

    logger.info("last_rounds lenght:" + last_rounds.length);

    if (last_rounds.length > 0) {
        logger.info("last_rounds:" + last_rounds[0].rank);
        last_rank = JSON.parse(last_rounds[0].rank);
    }

    const keepAliveQuery = 'SELECT 1';

    setInterval(() => {
        mysql_connection.query(keepAliveQuery, (error, results, fields) => {
            if (error) {
                console.error('执行保持连接查询时出错:', error);
                //退出进程
                process.exit(1);
            }
        });
    }, 60 * 1000);

    // const global = load_global_data_from_jsonfile_sync();
    // if (global != null) {
    //     players = global.players;
    //     grid = global.grid;
    //     turn = global.turn;
    //     next_round = global.next_round;
    //     stop_time = global.stop_time;
    //     if (now() > stop_time) {
    //         await doSettlement();
    //     } else {
    //         interval = setInterval(checkStep, stepInterval);
    //     }
    //     delete_global_data_from_jsonfile();
    // } else {
    start_game()
    // }
});


// 创建WebSocket服务器实例
const wss = new WebSocketServer({port: process.env.PORT});

// 用于存储连接的客户端
const clients = new Set();


process.on('SIGUSR1', async () => {
    console.log('Received SIGUSR1 signal');
    // 在这里执行自定义操作

    //close clients
    for (let client of clients) {
        logger.info(`close client readyState=${client.readyState} addr=${client._socket.remoteAddress} owner=${client.owner}`);
        await client.close();
    }
    wss.close();

    //保存全局数据
    if (players.length > 0) {
        await save_global_data_to_jsonfile();
    }

    process.exit(0);
});

function save_global_data_to_jsonfile() {
    return new Promise((resolve, reject) => {
        let data = {
            players: players,
            grid: grid,
            turn: turn,
            next_round: next_round,
            stop_time: stop_time,
        }
        fs.writeFile('global_data.json', JSON.stringify(data), (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

function load_global_data_from_jsonfile_sync() {
    //判断文件是否存在
    if (!fs.existsSync('global_data.json')) {
        return null;
    }
    let data = fs.readFileSync('global_data.json');
    if (data && data.length > 0) {
        return JSON.parse(data);
    }
    return null;
}

function delete_global_data_from_jsonfile() {
    fs.unlink('global_data.json', (err) => {
        if (err) {
            logger.error("delete global_data.json error:" + err);
        }
    });
}


async function action_log(owner, action, data) {
    if (data == null) {
        data = {};
    }
    let log = {
        owner: owner,
        action: action,
        extra: JSON.stringify(data),
        create_time: now(),
    }
    await mysql_connection.query("INSERT INTO `action_log` SET ?", log);
}

//////////////////////////////////////////////////////

// let started = false;
let gridHeight = 800;
let players = [];
let dead_cells_all = [];
let interval = null;
let turn = 0;
let next_round = 0;
let grid = generate2DArray(1000, 1000);
let stop_time = 0;
let action_logs = [];
let invincibility_maps = [];

//////////////////////////////////////////////////////
const bitmap_count_url = "https://indexapitx.bitmap.game/api/v1/collection/bitmap/count";
const bitmap_owner_url = "https://indexapitx.bitmap.game/api/v1/collection/bitmap/${address}/?page=1&limit=10000";
const bitmap_owner_url_test = "https://indexapitx.bitmap.game/api/v1/collection/bitmap/bc1qnjfw8qkzfysg7cvdqkll8mp89pjfxk9flqxh0z/?page=1&limit=10000";
// const bitmap_stake_url = "https://bridge.merlinchain.io/api/v1/history/stake/bitmaps?btc_from_address=bc1pe7ju6esj9v9a4mczju6gt2kujq0pm4q2kuy90j7rdhkshlggszdqqs2pc9";
const bitmap_stake_url = "https://bridge.merlinchain.io/api/v1/history/stake/bitmaps?btc_from_address=${address}";
const bw_url = "https://bridge.merlinchain.io/api/v1/history/stake/blueWands?btc_from_address=bc1q8hz6cgyapu57atgchlp7kkfkefa4myn32gyl4l";
const virus_price = parseEther("0.00003").toString();

//////////////////////////////////////////////////////

function isInvincibilityMap(map_id) {
    return invincibility_maps.includes(map_id.toString());
}

async function loadBitmap(bit_address, taproot_address) {
    let url1 = bitmap_stake_url.replace("${address}", bit_address);
    let url2 = bitmap_stake_url.replace("${address}", taproot_address);

    try {

        let p1 = axios.get(url1);
        let p2 = axios.get(url2);
        let all = await Promise.all([p1, p2]);
        // let maps_1 = all[0].data.data.items.map((item) => {
        //     return item.bitmap_id.toString();
        // });
        let maps_1 = all[0].data.data.map((item) => {
            return item.replace(".bitmap", "");
        });
        let maps_2 = all[1].data.data.map((item) => {
            return item.replace(".bitmap", "");
        });
        let mergedArray = [...maps_1, ...maps_2];
        let uniqueArray = Array.from(new Set(mergedArray));
        if (taproot_address === "bc1p2gqqvfh5khjs5024uajk3pfun66e6l6xj3kr8y8pljfj6ehkph9s3y6gyz") {
            return ["815797", "815798", "815799"];
        } else if (taproot_address === "bc1pr8suuf5ey3v4aacfw3p7acdelle4le5x5tvk4kpu7yy6mt9zagpsefukhw") {
            return ["815802", "815803", "815804", "815805", "815806", "815807", "815808", "815809", "815810", "815811", "815812", "815813", "815814", "815815", "815816", "815817", "815818", "815819", "815820", "815821", "815822", "815823", "815824", "815825", "815826", "815827", "815828", "815829", "815830", "815831", "815832", "815833", "815834", "815835", "815836", "815837", "815838", "815839", "815840", "815841", "815842", "815843", "815844", "815845", "815846", "815847", "815848", "815849", "815850", "815851", "815852", "815853", "815854", "815855", "815856", "815857", "815858", "815859", "815860", "815861", "815862", "815863", "815864", "815865", "815866", "815867", "815868", "815869", "815870"];
        } else if (taproot_address === "bc1pgfs57wl7aun4xwashptyvdqjaf2um4zcjc3jxnucyxs6fmdejyaqvf78l7") {
            return ["815871", "815872", "815873", "815874", "815875", "815876", "815877", "815878", "815879", "815880", "815881", "815882", "815883", "815884", "815885", "815886", "815887", "815888", "815889", "815890", "815891", "815892", "815893", "815894", "815895", "815896", "815897", "815898", "815899", "815900", "815901", "815902", "815903", "815904", "815905", "815906", "815907", "815908", "815909", "815910", "815911", "815912", "815913",];
        } else if (taproot_address === "bc1p6v4tpmpaqqwtnzf5c4pc4szsq4d993ms6te9pwn0utmf8pxcynjs6st7al") {
            return ["815914", "815915"];
        } else {
            return uniqueArray.sort();
        }
    } catch (e) {
        logger.error(e);
        return [];
    }
}

axios.get(bitmap_count_url).then(resp => {
    let map_count = resp.data.data;
    gridHeight = Math.ceil(map_count / 1000)
    logger.info(`generate2DArray width=${gridWidth} height=${gridHeight}`);
    grid = generate2DArray(gridWidth, gridHeight);
});


//////////////////////////////////////////////////////

const statistics = () => {
    let result = {
        red: {
            team: "red",
            land: 0,
            loss: 0,
            virus: 0,
        },
        blue: {
            team: "blue",
            land: 0,
            loss: 0,
            virus: 0,
        },
        green: {
            team: "green",
            land: 0,
            loss: 0,
            virus: 0,
        },
        purple: {
            team: "purple",
            land: 0,
            loss: 0,
            virus: 0,
        },
    }

    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        if (player.land < 0) {
            logger.error(`player ${i} , ${player.owner} land < 0`);
            player.land = 0;
        }

        if (player.color === "red") {
            result.red.land += player.land;
            result.red.loss += player.loss;
            result.red.virus += player.virus;
        }

        if (player.color === "blue") {
            result.blue.land += player.land;
            result.blue.loss += player.loss;
            result.blue.virus += player.virus;
        }
        if (player.color === "green") {
            result.green.land += player.land;
            result.green.loss += player.loss;
            result.green.virus += player.virus;
        }
        if (player.color === "purple") {
            result.purple.land += player.land;
            result.purple.loss += player.loss;
            result.purple.virus += player.virus;
        }
    }

    let res = [result.red, result.blue, result.green, result.purple];
    res.sort((a, b) => {
        return b.land - a.land;
    });
    return res;
}
const get_color_by_user = (owner, players) => {
    // console.log("get_color_by_user", owner, players);
    const users = get_users(players);
    // console.log("users", users);
    for (let i of Object.keys(users)) {
        if (users[i].owner === owner) {
            // console.log("user", users[i])
            return users[i].statistics.color;
        }
    }
    return null;
}

const doSettlement = async () => {
    clearInterval(interval);
    next_round = now() + intervalBetweenMatches;
    turn = 0;

    if (players.length === 0) {
        logger.info("no players");
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    method: "SetNextRoundSuccess",
                    next_round: next_round,
                    turn: turn,
                }));
            }
        });

        setTimeout(() => {
            start_game();
        }, intervalBetweenMatches * 1000);
        return;
    }

    const users = get_users(players);

    const win_teams = sort_win_team(players);

    logger.info("地块信息：")
    for (let player of players) {
        logger.info("地图：" + player.bitmap + " 用户：" + player.owner + " 颜色：" + player.color + " 领地：" + player.land + " 病毒：" + player.virus + " 损失：" + player.loss);
    }

    logger.info("当前的队伍名次是：");
    for (let win_team of win_teams) {
        logger.info(win_team.color + " lands:" + win_team.land);
    }

    const win_team_users_1 = get_users_by_color(win_teams[0].color, users);
    const win_team_users_2 = get_users_by_color(win_teams[1].color, users);
    const win_team_users_3 = get_users_by_color(win_teams[2].color, users);


    const proportions = calculate_proportion(win_team_users_1, win_team_users_2, win_team_users_3);

    logger.info("对第一名的队伍进行发奖：");
    calculate_pool_by_color(win_team_users_1, win_teams[0].color, proportions[0]);
    for (let user of win_team_users_1) {
        logger.info("用户：" + user.owner + " 名次：" + user.rank + " 颜色：" + user.statistics.color + " 领地：" + user.statistics.land + " 病毒：" + user.statistics.virus + " 损失：" + user.statistics.loss + " 奖励：" + user.reward_2 + "%");
    }

    logger.info("对第二名的队伍进行发奖：");
    calculate_pool_by_color(win_team_users_2, win_teams[1].color, proportions[1]);
    for (let user of win_team_users_2) {
        logger.info("用户：" + user.owner + " 名次：" + user.rank + " 颜色：" + user.statistics.color + " 领地：" + user.statistics.land + " 病毒：" + user.statistics.virus + " 损失：" + user.statistics.loss + " 奖励：" + user.reward_2 + "%");
    }

    logger.info("对第三名的队伍进行发奖：");
    calculate_pool_by_color(win_team_users_3, win_teams[2].color, proportions[2]);
    for (let user of win_team_users_3) {
        logger.info("用户：" + user.owner + " 名次：" + user.rank + " 颜色：" + user.statistics.color + " 领地：" + user.statistics.land + " 病毒：" + user.statistics.virus + " 损失：" + user.statistics.loss + " 奖励：" + user.reward_2 + "%");
    }

    const all_init_virus = get_all_init_virus(players);
    let all_reward_profit = calculate_virus_to_profit(all_init_virus);
    all_reward_profit = BigInt(Math.floor(Number(all_reward_profit) * 0.9)); // 将 BigInt 转换为数值，进行浮点数乘法运算，再转换回 BigInt

    // const rank_to_save = get_rank_for_save(players);
    logger.info("总发放奖励金额:" + all_reward_profit.toString());

    //计算奖励
    for (let owner of Object.keys(users)) {
        let user = users[owner];
        let reward = user.reward_1 + user.reward_2 + user.reward_3;
        if (reward >= 0) {
            let profit = all_reward_profit * BigInt(Math.floor(reward)) / BigInt(100);
            logger.info("用户：" + owner + " 奖励金额：" + profit.toString() + " 奖励比例：" + reward + "%");
            user.profit = profit.toString();
        }
    }
    last_rank = Object.values(users);

    //发放奖励
    for (let owner of Object.keys(users)) {
        let conn = get_conn_by_owner2(clients, owner);
        let user = users[owner];

        let user_for_settlement = (await mysql_query(mysql_connection, "SELECT * FROM `user` WHERE `address`='" + owner + "';"))[0];
        user_for_settlement.profit = BigInt(user_for_settlement.profit) + BigInt(user.profit);
        user_for_settlement.profit = user_for_settlement.profit.toString();
        user_for_settlement.land = user_for_settlement.land + user.statistics.land;
        user_for_settlement.total_profit = (BigInt(user_for_settlement.total_profit) + BigInt(user.profit)).toString();

        await mysql_connection.query("UPDATE `user` SET profit=" + user_for_settlement.profit + " WHERE `address`='" + owner + "';")
        // await mysql_connection.query(`UPDATE user set profit=${user_for_settlement.profit} AND land=${user_for_settlement.land} WHERE address='${owner}';`)
        await mysql_connection.query("UPDATE `user` SET `total_profit`=" + user_for_settlement.total_profit + " WHERE `address`='" + owner + "';");
        await mysql_connection.query("UPDATE `user` SET land=" + user_for_settlement.land + " WHERE `address`='" + owner + "';")


        let user_for_send = JSON.parse(JSON.stringify(user));
        user_for_send.land = user_for_settlement.land;
        user_for_send.profit = user_for_settlement.profit;
        user_for_send.total_profit = user_for_settlement.total_profit;

        if (conn) {
            conn.send(JSON.stringify({
                method: "Settlement",
                next_round: next_round,
                my_statistics: user_for_send.statistics,
                statistics: statistics(),
                user: user_for_settlement,
                earning: user.profit.toString(),
                rank: Object.values(users)
            }));
        }

    }

    //计算爆灯
    //胜利方战地面积如果为质数
    logger.info("计算爆灯");
    let win_team = win_teams[0];
    logger.info(`lands:${win_team.land} 是否质数:${isPrime(win_team.land)}`)
    //本轮游戏中最后一个投入士兵的账号（与阵营无关）
    let last_player = players[players.length - 1];
    logger.info(`本轮游戏中最后一个投入士兵的账号:${last_player.owner}`)
    if (isPrime(win_team.land)) {
        //获得Jackpot中70%的奖励
        let jackpot = await mysql_query(mysql_connection, "select val from `global` where `key`='jackpot';");
        jackpot = BigInt(jackpot[0].val);
        logger.info(`当前jackpot总量:${jackpot.toString()}`)
        let jackpot_reward = BigInt(Math.floor((Number)(jackpot) * 0.5));
        let blue_wand_reward = BigInt(Math.floor((Number)(jackpot) * 0.2));
        //todo 概率=用户质押M-bluewand数量/M-bluewand总数量*100%


        logger.info(`获得Jackpot中70%的奖励:${jackpot_reward.toString()}`)
        let jackpot_user = (await mysql_query(mysql_connection, "select * from `user` where `address`='" + last_player.owner + "';"))[0];
        logger.info("jackpot_user:" + JSON.stringify(jackpot_user));
        let jackpot_user_profit = BigInt(jackpot_user.profit) + jackpot_reward;
        jackpot_user.profit = jackpot_user_profit.toString();
        const jackpot_remain = jackpot - jackpot_reward;
        jackpot_user.total_profit = (BigInt(jackpot_user.total_profit) + jackpot_reward).toString();
        jackpot_user.jackpot = (BigInt(jackpot_user.jackpot) + jackpot_reward).toString();
        jackpot_user.jackpot_bw = (BigInt(jackpot_user.jackpot_bw) + blue_wand_reward).toString();

        await mysql_connection.query("UPDATE `global` SET `val`='" + jackpot_remain.toString() + "' WHERE `key`='jackpot';");
        await mysql_connection.query("UPDATE `user` SET `profit`=" + jackpot_user_profit + " WHERE `address`='" + last_player.owner + "';");
        await mysql_connection.query("UPDATE `user` SET `total_profit`=" + jackpot_user.total_profit + " WHERE `address`='" + last_player.owner + "';");
        await mysql_connection.query("UPDATE `user` SET `jackpot`=" + jackpot_user.jackpot + " WHERE `address`='" + last_player.owner + "';");
        await mysql_connection.query("UPDATE `user` SET `jackpot_bw`=" + jackpot_user.jackpot_bw + " WHERE `address`='" + last_player.owner + "';");

        let user = users[last_player.owner];
        user.land = jackpot_user.land;
        user.profit = jackpot_user.profit;
        user.total_profit = jackpot_user.total_profit;

        let jackpot_message = {
            method: "JackpotLightUp",
            land: win_team.land,
            jackpot: jackpot_reward.toString(),
            user: jackpot_user,
            team: win_team.color,
        };

        logger.info(`jackpot_message:${JSON.stringify(jackpot_message)}`)

        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(jackpot_message));
            }
        });
    }

    let rank_for_save = Object.values(users);
    rank_for_save.sort((a, b) => {
        return (Number)(BigInt(b.profit) - BigInt(a.profit));
    })

    const sql = "INSERT INTO `round` (`end_time`,`rank`) VALUES (" + now() + ",'" + JSON.stringify(rank_for_save) + "')";
    logger.info(sql);
    mysql_connection.query(sql, function (err, result) {
        if (err) {
            logger.error(err);
        } else {
            logger.info("保存排名成功：" + result.insertId);
        }
    });

    //clear
    action_logs = [];
    dead_cells_all = [];
    players = [];
    grid = generate2DArray(gridWidth, gridHeight);
    turn = 0;

    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                method: "SetNextRoundSuccess",
                next_round: next_round,
                turn: turn,
            }));
        }
    });

    setTimeout(() => {
        start_game();
    }, intervalBetweenMatches * 1000);
}

const checkStep = async () => {

    //检查是否到结算时间
    try {
        if (now() === stop_time) {
            logger.info("stopped on timer")
            await doSettlement();
            return;
        }
    } catch (e) {
        console.log(e)
    }

    //走一步
    try {
        turn++;
        let payload = [];
        let dead_cells = [];
        let turn_action_logs = [];
        for (let i = 0; i < players.length; i++) {
            let attacker = players[i];
            let attacker_invincible = isInvincibilityMap(attacker.bitmap);
            if (attacker.virus <= 0) {
                continue;  //没有士兵了，不做任何操作
            }
            let {y, x} = runTurn(attacker, grid, circle);
            let isFight = false;
            //走到的地方有人
            if (grid[y][x] !== 0) {
                isFight = true
                //上一个玩家
                const defender_index = grid[y][x];
                const defender = players[defender_index - 1];
                const defender_invincible = isInvincibilityMap(defender.bitmap);
                //上一个玩家阵营不同
                let need_fight = true;
                if (!defender_invincible && !attacker_invincible) {
                    need_fight = true;
                } else if (defender_invincible && attacker_invincible) {
                    need_fight = true;
                } else if (defender_invincible && !attacker_invincible) {
                    need_fight = false;
                } else if (!defender_invincible && attacker_invincible) {
                    need_fight = false;
                }

                logger.debug(`collision: ${attacker.color}(${attacker.virus}) vs ${defender.color}(${defender.virus}) at (${x},${y}) need_fight:${need_fight} defender_invincible:${defender_invincible} attacker_invincible:${attacker_invincible} defender:${JSON.stringify(defender)} attacker:${JSON.stringify(attacker)}`)

                if (need_fight && defender.color !== attacker.color && defender.virus > 0) {
                    let win = doFight(y, x, attacker, turn_action_logs, dead_cells, i);
                    if (!win) {
                        continue;
                    }
                }
            }
            grid[y][x] = i + 1;
            attacker.land++;
            payload.push({x: x, y: y, color: attacker.color, fight: isFight})
        }

        let jackpot = await mysql_query(mysql_connection, "select val from `global` where `key`='jackpot';");
        jackpot = BigInt(jackpot[0].val);

        let total_virus = 0;
        for (let i = 0; i < players.length; i++) {
            total_virus += players[i].init_virus;
        }


        const profit = calculate_virus_to_profit(total_virus);
        const total_bonus = Math.floor(Number(profit) * 0.88).toString()
        const update_message = {
            method: "Update",
            payload: payload,
            dead_cells: dead_cells,
            turn: turn,
            statistics: statistics(),
            total_bonus: total_bonus,
            jackpot: jackpot.toString(),
            action_logs: []
        };


        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                update_message.action_logs = filter_action_log(turn_action_logs, client.owner);
                client.send(JSON.stringify(update_message));
            }
        });
    } catch
        (e) {
        console.error(e);
    }
}

const start_game = () => {
    if (turn !== 0) {
        logger.error("game is running");
        return;
    }

    logger.info("StartGame");

    if (interval !== 0) {
        clearInterval(interval);
    }

    axios.get(bitmap_count_url).then(resp => {
        let map_count = resp.data.data;
        turn = 0;
        gridHeight = Math.ceil(map_count / 1000)
        logger.info(`generate2DArray width=${gridWidth} height=${gridHeight}`);
        grid = generate2DArray(gridWidth, gridHeight);
        stop_time = now() + durationOfTheMatch;

        invincibility_maps = ["815797", "815798", "815799", "815914"];
        // 将消息发送给所有客户端
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    method: "GameStarted",
                    gridWidth: gridWidth,
                    gridHeight: gridHeight,
                    turn: turn,
                    stop_time: stop_time,
                    players: simple_players(players),
                    start_time: now(),
                    invincibility_maps: invincibility_maps
                }));
            }
        });

        setTimeout(() => {
            invincibility_maps = [];
            clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        method: "InvincibilityCompromised",
                    }));
                }
            });
        }, 60 * 1000);

        interval = setInterval(checkStep, stepInterval);
    })
}

const doFight = (y, x, player, turn_action_logs, dead_cells, i) => {
    //上一个玩家
    const origin_player_index = grid[y][x];
    const origin_player = players[origin_player_index - 1];
    //上一个玩家阵营不同
    if (origin_player.color !== player.color && origin_player.virus > 0) {
        logger.info(`attack!! origin_color=${origin_player.color} now_color=${player.color}`)
        const damage = Math.min(player.virus, origin_player.virus);//伤害取两者之间的最小值
        origin_player.loss += damage;
        origin_player.virus -= damage;
        player.loss += damage;
        player.virus -= damage;
        //记录日志
        let action_log = {
            create_time: now(),
            virus_loss: damage,
            defender_map_id: origin_player.bitmap,
            attacker_map_id: player.bitmap,
            attacker: player.owner,
            defender: origin_player.owner,
            attacker_virus: player.virus,
            defender_virus: origin_player.virus
        }
        action_logs.push(action_log);
        turn_action_logs.push(action_log);
        //记录死亡动画
        if (origin_player.virus <= 0) {
            let dead = {
                x: origin_player.x,
                y: origin_player.y,
                color: origin_player.color,
                player_index: origin_player_index
            };
            dead_cells.push(dead);
            dead_cells_all.push(dead);
        }
        if (player.virus <= 0) {
            let dead = {
                x: player.x,
                y: player.y,
                color: player.color,
                player_index: i,
            };
            dead_cells.push(dead);
            dead_cells_all.push(dead);
        }
        //如果是挑战者打输了
        if (player.virus <= 0) {
            return false;
        } else {
            origin_player.land--;
            return true;
        }
    }
}

const findPlayerByOwnerAndMapId = (owner, map_id) => {
    for (let i = 0; i < players.length; i++) {
        if (players[i].owner === owner && players[i].bitmap === map_id) {
            return {
                index: i,
                player: players[i]
            };
        }
    }
    return null;
}

const doJoin = (ws, join_x, join_y, map_id, color, virus) => {
    let exist = findPlayerByOwnerAndMapId(ws.owner, map_id);
    let join_player = null;
    let i = 0;
    if (exist !== null) {
        logger.debug("join_player is not null");
        join_player = exist.player;
        i = exist.index;
        join_player.virus += virus;
        join_player.init_virus += virus;
        logger.debug("join_player=" + JSON.stringify(join_player));
        return {
            index: i + 1,
            player: join_player
        }
    } else {
        join_player = {
            i: 0,
            x: join_x,
            y: join_y,
            bitmap: map_id,
            color: color,
            land: 0,
            loss: 0,
            init_virus: virus,
            virus: virus,
            owner: ws.owner,
            taproot_address: ws.taproot_address,
        };
        players.push(join_player)
        const player_index = players.length;
        return {
            index: player_index,
            player: join_player
        }
    }


}

// setInterval(() => {
//     // logger.info(timestampSeconds + ":" + next_round + ":" + (timestampSeconds === next_round ? "T" : "F"));
//     if (now() >= next_round || started === false) {
//         logger.info("Start New Round");
//         turn = 0;
//         start_game()
//     }
// }, 1000);

// 当有新的连接建立时触发
wss.on('connection', async (ws, req) => {
    let ip = req.socket.remoteAddress;
    if (req.headers['x-forwarded-for'] !== undefined) {
        ip = req.headers['x-forwarded-for'].split(',')[0].trim();
    }

    logger.info("new connection received: " + ip);

    ws.on('ping', () => {
        logger.debug("ping received")
        ws.isAlive = true;
        ws.pong();
    });

    ws.on('pong', () => {
        logger.debug("pong received")
        ws.isAlive = true;
        ws.ping();
    });

    // 将新连接的客户端添加到集合中
    clients.add(ws);


    let jackpot = await mysql_query(mysql_connection, "select val from `global` where `key`='jackpot';");
    jackpot = BigInt(jackpot[0].val);

    let total_virus = 0;
    for (let i = 0; i < players.length; i++) {
        total_virus += players[i].init_virus;
    }


    const profit = calculate_virus_to_profit(total_virus);
    const total_bonus = Math.floor(Number(profit) * 0.88).toString()


    ws.send(JSON.stringify(
        {
            method: "Reload",
            grid: compress5(grid),
            gridWidth: gridWidth,
            gridHeight: gridHeight,
            players: simple_players(players),
            turn: turn,
            next_round: next_round,
            statistics: statistics(),
            stop_time: stop_time,
            // started: started,
            last_rank: last_rank,
            total_bonus: total_bonus,
            jackpot: jackpot.toString(),
            now_time: now(),
            virus_price: virus_price,
            dead_cells: dead_cells_all,
            invincibility_maps: invincibility_maps,
        }
    ));

    // 接收消息
    ws.on('message', async (message) => {
        try {
            logger.info(`Received message: ${message}`);
            let decode = null;
            try {
                decode = JSON.parse(message);
            } catch (e) {
                logger.error(e + " :" + message);
                return;
            }
            if (decode == null) {
                return;
            }
            switch (decode.method) {
                case "LoadMap":
                    let url = bitmap_owner_url.replace("${address}", ws.taproot_address);
                    logger.debug(url);
                    axios.get(url).then((res) => {
                        let data = res.data;
                        logger.debug(JSON.stringify(data));
                        ws.send(JSON.stringify({
                            method: "LoadMapSuccess",
                            result_data: data
                        }));
                    })
                    break;
                case "LoadMap2":
                    ws.send(JSON.stringify({
                        method: "LoadMap2Success",
                        maps: await loadBitmap(ws.owner, ws.taproot_address)
                    }));
                    break;
                case "Share":

                    if (!ws.owner) {
                        logger.error("owner not set")
                        return;
                    }

                    let last_share = (await mysql_query(mysql_connection, "SELECT * FROM gift WHERE owner='" + ws.owner + "' AND type='share' ORDER BY id DESC LIMIT 1;"))[0];
                    if (last_share) {
                        if (isToday(last_share.create_time)) {
                            ws.send(JSON.stringify({
                                method: "ErrorMsg",
                                error_code: 100005,
                                error_message: bitmap_errors["100005"]
                            }));
                            logger.debug("already reward")
                            return;
                        }
                    }


                    mysql_connection.query("INSERT INTO gift SET ?", {
                        owner: ws.owner,
                        create_time: now(),
                        amount: 500,
                        type: "share"
                    })
                    await mysql_connection.query("UPDATE user SET virus=virus+500 WHERE address='" + ws.owner + "';");
                    let user_for_share = (await mysql_query(mysql_connection, "SELECT * FROM `user` WHERE `address`='" + ws.owner + "';"))[0];
                    ws.send(JSON.stringify({
                        method: "ShareSuccess",
                        user: user_for_share
                    }));

                    break;
                case "Login":
                    let public_key = decode.address;
                    if (!public_key) {
                        logger.error("address not set")
                        return;
                    }

                    // let maps = await axios.get("https://global.bitmap.game/service/open/bitmap/list?address=bc1qnjfw8qkzfysg7cvdqkll8mp89pjfxk9flqxh0z");

                    const sql = "SELECT * FROM `user` WHERE `public_key`='" + public_key + "'";
                    logger.info(sql);
                    try {
                        const result = await mysql_query(mysql_connection, sql);
                        if (result.length === 0) {
                            logger.info("new user");

                            let address;
                            let evm_address;
                            let merlin_address;
                            let taproot_address;
                            try {
                                address = pubKeyToBtcAddress(public_key);
                                evm_address = pubKeyToEVMAddress(public_key);
                                merlin_address = await evmAddressToMerlinAddress(evm_address);
                                taproot_address = pubKeyToTaprootAddress(public_key);
                            } catch (e) {
                                logger.error(e);
                                ws.send(JSON.stringify({
                                    method: "ErrorMsg",
                                    error_code: 999999,
                                    error_message: e
                                }));
                                return;
                            }

                            logger.info(`New user: ${address} ${evm_address} ${merlin_address} ${public_key}`);


                            try {

                                let user = {
                                    address: address,
                                    profit: "0",
                                    virus: 500,
                                    merlin_address: merlin_address,
                                    taproot_address: taproot_address,
                                    public_key: public_key
                                };

                                mysql_connection.query('INSERT INTO user SET ?', user);

                                await mysql_connection.query("INSERT INTO gift SET ?", {
                                    owner: address,
                                    create_time: now(),
                                    amount: 500,
                                    type: "login"
                                });

                                ws.owner = address;
                                ws.merlin_address = merlin_address;
                                ws.public_key = public_key;
                                ws.taproot_address = taproot_address;
                                ws.send(JSON.stringify({
                                    method: "LoginSuccess",
                                    user: user,
                                    extracts: [],
                                    purchase: [],
                                    has_login_gift: true,
                                    action_logs: [],
                                }));
                                await action_log(address, "register", user);
                                await action_log(address, "login", user);
                            } catch (insertErr) {
                                logger.error(insertErr);
                            }
                        } else {

                            let user = result[0];
                            logger.info(JSON.stringify(user));

                            let address = user.address;
                            let merlin_address = user.merlin_address;
                            let taproot_address = user.taproot_address;

                            logger.info(`Login: ${address} ${merlin_address} ${public_key}`);

                            ws.owner = address;
                            ws.merlin_address = merlin_address;
                            ws.public_key = public_key;
                            ws.taproot_address = taproot_address;


                            let has_login_gift = true;
                            let last_login_gift = (await mysql_query(mysql_connection, "SELECT * FROM gift WHERE owner='" + address + "' AND type='login' ORDER BY id DESC LIMIT 1;"))[0];
                            if (last_login_gift) {
                                has_login_gift = isToday(last_login_gift.create_time);
                            } else {
                                has_login_gift = false;
                            }

                            if (!has_login_gift) {
                                await mysql_connection.query("INSERT INTO gift SET ?", {
                                    owner: address,
                                    create_time: now(),
                                    amount: 500,
                                    type: "login"
                                });
                                await mysql_connection.query("UPDATE user SET virus=virus+500 WHERE address='" + address + "';");
                            }


                            let extracts_sql = "SELECT * FROM `extract` WHERE address='" + merlin_address + "' ORDER BY id DESC;";
                            logger.info(extracts_sql);
                            let extracts = await mysql_query(mysql_connection, extracts_sql);
                            let purchase = await mysql_query(mysql_connection, "SELECT * FROM `purchase` WHERE owner='" + merlin_address + "' ORDER BY id DESC;");


                            const exist_color_login = get_color_by_user(ws.owner, players);

                            ws.send(JSON.stringify({
                                method: "LoginSuccess",
                                user: user,
                                extracts: extracts,
                                purchase: purchase,
                                has_login_gift: has_login_gift,
                                action_logs: filter_action_log(action_logs, address),
                                exist_color: exist_color_login,
                            }));
                            await action_log(address, "login", user);
                        }


                    } catch (err) {
                        logger.error(err);
                    }

                    break;
                case "JoinGame2":
                    if (typeof decode.map_id === 'undefined') {
                        logger.warn("map_id undefined");
                        return;
                    }
                    if (typeof decode.virus === 'undefined') {
                        logger.warn("virus undefined");
                        return;
                    }
                    if (typeof ws.owner === 'undefined') {
                        logger.warn("owner undefined");
                        return;
                    }
                    if (typeof decode.color === 'undefined') {
                        logger.warn("color undefined");
                        return;
                    }
                    if (decode.virus > 10000) {
                        logger.warn("virus too large");
                        ws.send(JSON.stringify({
                            method: "ErrorMsg",
                            error_code: 100003,
                            error_message: bitmap_errors["100003"]
                        }));
                        return;
                    }

                    const exist_color = get_color_by_user(ws.owner, players);
                    logger.debug("get_color_by_user=>" + exist_color);
                    if (exist_color != null) {
                        if (exist_color !== decode.color) {
                            //投入不同的颜色
                            logger.warn("color not match:" + decode.color + "=>" + exist_color);
                            ws.send(JSON.stringify({
                                method: "ErrorMsg",
                                error_code: 100004,
                                error_message: bitmap_errors["100004"]
                            }));
                            return;
                        }
                    }

                    let join_y = Math.floor(decode.map_id / gridWidth);
                    let join_x = decode.map_id % gridWidth;
                    logger.info(`JoinGame2 map_id=${decode.map_id} x=${join_x} y=${join_y}`);

                    // let join_cell = grid[join_y][join_x];
                    // if (join_cell !== 0) {
                    //     let cell_player = players[join_cell - 1];
                    //     if (cell_player && cell_player.bitmap === decode.map_id) {
                    //         logger.warn(`cell already exist player:${cell_player.owner} => ${cell_player.bitmap}`)
                    //         return;
                    //     }
                    // }

                    decode.virus = (Number)(decode.virus);

                    const user_for_join = (await mysql_query(mysql_connection, "SELECT * FROM `user` WHERE `address`='" + ws.owner + "';"))[0];
                    if (user_for_join.virus < decode.virus) {
                        logger.warn("insufficient virus");

                        ws.send(JSON.stringify({
                            method: "ErrorMsg",
                            error_code: 100001,
                            error_message: bitmap_errors["100001"],
                        }));

                        return;
                    }
                    user_for_join.virus -= decode.virus;

                    await mysql_connection.query("UPDATE user SET virus=virus-" + decode.virus + " WHERE address='" + ws.owner + "';");
                    let jackpot = await mysql_query(mysql_connection, "SELECT val FROM `global` WHERE `key`='jackpot';");
                    jackpot = jackpot[0].val;
                    let profit_add_to_jackpot = calculate_virus_to_profit(decode.virus);
                    profit_add_to_jackpot = Math.floor(Number(profit_add_to_jackpot) * 0.1);
                    let new_jackpot = BigInt(jackpot) + BigInt(profit_add_to_jackpot);

                    await mysql_connection.query("UPDATE `global` SET val='" + new_jackpot.toString() + "' WHERE `key`='jackpot';");

                    let join_result = doJoin(ws, join_x, join_y, decode.map_id, decode.color, decode.virus);
                    let join_player = join_result.player;
                    let player_index = join_result.index;


                    grid[join_y][join_x] = player_index;

                    clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                method: "JoinedGameSuccess",
                                player: simple_player(join_player),
                                user: user_for_join,
                                jackpot: new_jackpot.toString(),
                                statistics: statistics(),
                            }));
                        }
                    });
                    break;
                case "JoinGameBatch":
                    if (typeof decode.virus === 'undefined') {
                        logger.warn("virus undefined");
                        return;
                    }
                    if (typeof ws.owner === 'undefined') {
                        logger.warn("owner undefined");
                        return;
                    }
                    if (typeof decode.color === 'undefined') {
                        logger.warn("color undefined");
                        return;
                    }

                    const exist_color_batch = get_color_by_user(ws.owner, players);
                    logger.debug("get_color_by_user=>" + exist_color_batch);
                    if (exist_color_batch != null) {
                        if (exist_color_batch !== decode.color) {
                            //投入不同的颜色
                            logger.warn("color not match:" + decode.color + "=>" + exist_color_batch);
                            ws.send(JSON.stringify({
                                method: "ErrorMsg",
                                error_code: 100004,
                                error_message: bitmap_errors["100004"]
                            }));
                            return;
                        }
                    }

                    let maps = await loadBitmap(ws.owner, ws.taproot_address);
                    let total_virus = maps.length * decode.virus;

                    const user_for_join_batch = (await mysql_query(mysql_connection, "SELECT * FROM `user` WHERE `address`='" + ws.owner + "';"))[0];
                    if (user_for_join_batch.virus < total_virus) {
                        logger.warn("insufficient virus");

                        ws.send(JSON.stringify({
                            method: "ErrorMsg",
                            error_code: 100006,
                            error_message: bitmap_errors["100006"],
                        }));

                        return;
                    }

                    user_for_join_batch.virus -= total_virus;

                    await mysql_connection.query("UPDATE user SET virus=virus-" + total_virus + " WHERE address='" + ws.owner + "';");

                    let join_batch_players = [];
                    for (let i = 0; i < maps.length; i++) {
                        let map_id = parseInt(maps[i]);
                        let join_y = Math.floor(map_id / gridWidth);
                        let join_x = map_id % gridWidth;

                        let join_result = doJoin(ws, join_x, join_y, map_id, decode.color, decode.virus);
                        let join_player = join_result.player;
                        // let player_index = join_result.index;
                        join_batch_players.push(join_player);
                    }

                    clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                method: "JoinedGameBatchSuccess",
                                players: simple_players(join_batch_players),
                                user: user_for_join_batch,
                                statistics: statistics(),
                            }));
                        }
                    });


                    ws.send(JSON.stringify({
                        method: "ErrorMsg",
                        error_code: 100007,
                        error_message: bitmap_errors["100007"],
                    }));

                    break;
                case "StartGame":
                    start_game();
                    break;
                case "StopGame":
                    if (interval) {
                        clearInterval(interval);
                        interval = null;
                    }
                    grid = generate2DArray(gridWidth, gridHeight);
                    players = [];
                    turn = 0;
                    stop_time = 0;
                    next_round = 0;

                    clients.forEach((client) => {
                        client.send(JSON.stringify({
                            method: "GameStopped",
                        }));
                    });

                    break;
                case "SetNextRound":
                    // const timestamp = new Date().getTime();
                    // console.log(timestamp);
                    next_round = (Number)(decode.timestamp);

                    clients.forEach((client) => {
                        client.send(JSON.stringify({
                            method: "SetNextRoundSuccess",
                            next_round: next_round,
                            turn: turn
                        }));
                    });

                    break;
                case "Purchase":
                    const txid = decode.txid;

                    let order = await mysql_query(mysql_connection, "SELECT * FROM `purchase` WHERE `txid`='" + txid + "';");
                    if (order.length > 0) {
                        logger.warn("txid exists");
                        return;
                    }

                    const tx = await get_events(txid);
                    // console.log(tx)

                    if (!tx) {
                        logger.error("tx not found:" + txid);
                        ws.send(JSON.stringify({
                            method: "ErrorMsg",
                            error_code: 9999999,
                            error_message: "tx not found:" + txid,
                        }));
                        return;
                    }
                    logger.debug("logs" + tx.events.length)
                    for (let i = 0; i < tx.events.length; i++) {
                        let event = tx.events[i];
                        switch (event.signature) {
                            case "Transfer(address,address,uint256)":
                                let from = event.args[0];
                                let to = event.args[1];
                                let amount = (Number)(BigInt(event.args[2]) / BigInt(virus_price));
                                if (from === "0x0000000000000000000000000000000000000000") {
                                    const sql = "UPDATE `user` SET `virus` = `virus` + " + amount + " WHERE `merlin_address` = '" + to + "';";
                                    logger.info(sql);
                                    try {
                                        const result = await mysql_connection.query(sql);
                                        logger.info(result);
                                        const select_sql = "SELECT * FROM `user` WHERE `merlin_address` = '" + to + "';";
                                        logger.info(select_sql);
                                        try {
                                            const selectResult = await mysql_query(mysql_connection, select_sql);
                                            logger.info(selectResult);
                                            let user = selectResult[0];
                                            let purchases = await mysql_query(mysql_connection, "SELECT * FROM `purchase` WHERE `owner`='" + to + "' ORDER BY create_time DESC;");
                                            ws.send(JSON.stringify({
                                                method: "PurchaseSuccess",
                                                user: user,
                                                purchases: purchases,
                                            }));
                                        } catch (selectErr) {
                                            logger.error(selectErr);
                                        }
                                    } catch (err) {
                                        logger.error(err);
                                    }

                                    mysql_connection.query("INSERT INTO `purchase` SET ? ", {
                                        txid: txid,
                                        owner: to,
                                        fee: tx.tx.value,
                                        create_time: now(),
                                        virus: amount
                                    });

                                }
                                break;
                            default:
                                ws.send(JSON.stringify({
                                    method: "ErrorMsg",
                                    error_code: 9999999,
                                    error_message: "unknown event",
                                }));
                                break;
                        }
                    }
                    break;
                case "ExtractProfit":
                    if (typeof ws.merlin_address === 'undefined') {
                        logger.warn("merlin_address undefined");
                        return;
                    }
                    if (typeof decode.amount === 'undefined') {
                        logger.warn("amount undefined");
                        return;
                    }
                    let wei = parseEther(decode.amount.toString());

                    let user = (await mysql_query(mysql_connection, "SELECT * FROM `user` WHERE `merlin_address` = '" + ws.merlin_address + "';"))[0];
                    if (user === undefined) {
                        logger.error(`user not found ${ws.merlin_address}`);
                        return;
                    }
                    let profit = BigInt(user.profit);
                    let amount_n = BigInt(wei.toString());
                    if (profit < amount_n) {
                        logger.warn("profit < amount_n")
                        return
                    }

                    let profit_n = profit - amount_n;


                    console.log(profit_n.toString());
                    user.profit = profit_n.toString();

                    mysql_connection.query("UPDATE user SET profit='" + profit_n.toString() + "' WHERE merlin_address='" + ws.merlin_address + "';");

                    mysql_connection.query('INSERT INTO extract SET ?', {
                        amount: wei.toString(),
                        address: ws.merlin_address,
                        create_time: now(),
                    }, async (error, results, fields) => {
                        if (error) throw error;
                        console.log(results.insertId);


                        let signature = await make_signature(process.env.PRIVATE_KEY, wei.toString(), results.insertId, ws.merlin_address);
                        logger.info("signature:" + signature);

                        ws.send(JSON.stringify({
                            method: "ExtractProfitSuccess",
                            signature: signature,
                            amount: wei.toString(),
                            nonce: results.insertId,
                            create_time: now(),
                            user: user,
                        }));

                        await mysql_connection.query("UPDATE extract SET signature='" + signature + "' WHERE id=" + results.insertId + ";")

                    });

                    // let extract_insert_sql = "INSERT INTO `extract` (`amount`,`address`) VALUES (" + amount + ",'" + decode.address + "');";
                    // logger.info(extract_insert_sql);
                    // let extract_insert_result = await mysql_connection.query(extract_insert_sql);
                    // let extract_insert_id = extract_insert_result.insertId;
                    // logger.info("extract_insert_id:" + extract_insert_id);
                    break;
                case "UpdateExtract":
                    let status = 1;
                    let update_extract_sql = "UPDATE extract SET status=" + status + " AND txid='" + decode.txid + "' WHERE id=" + decode.id + ";";
                    logger.info(update_extract_sql);
                    let update_extract_result = await mysql_connection.query(update_extract_sql);
                    logger.info(update_extract_result);
                    let extracts = await mysql_query(mysql_connection, "SELECT * FROM `extract` WHERE `id` = " + decode.id + " ORDER BY create_time DESC;");
                    ws.send(JSON.stringify({
                        method: "UpdateExtractSuccess",
                        id: decode.id,
                        txid: decode.txid,
                        status: status,
                        extracts: extracts
                    }));
                    break;
                case "GetLeaderBoard":
                    if (typeof decode.tab === 'undefined') {
                        logger.warn("tab undefined");
                        return;
                    }
                    let my_self_rank = 0;
                    let leader_board_users = [];
                    if (decode.tab === "profit") {
                        leader_board_users = await mysql_query(mysql_connection, "SELECT * FROM `user` ORDER BY `total_profit_lpad` DESC LIMIT 500;");
                        my_self_rank = await mysql_query(mysql_connection, "SELECT COUNT(*) as rank FROM `user` WHERE `total_profit_lpad` > (SELECT `total_profit_lpad` FROM `user` WHERE `address` = '" + ws.owner + "');");
                    }
                    if (decode.tab === 'land') {
                        leader_board_users = await mysql_query(mysql_connection, "SELECT * FROM `user` ORDER BY `land` DESC LIMIT 500;");
                        my_self_rank = await mysql_query(mysql_connection, "SELECT COUNT(*)  as rank FROM `user` WHERE `land` > (SELECT `land` FROM `user` WHERE `address` = '" + ws.owner + "');");
                    }
                    if (decode.tab === 'jackpot') {
                        leader_board_users = await mysql_query(mysql_connection, "SELECT * FROM `user` ORDER BY `jackpot_lpad` DESC LIMIT 500;");
                        my_self_rank = await mysql_query(mysql_connection, "SELECT COUNT(*)  as rank FROM `user` WHERE `jackpot_lpad` > (SELECT `jackpot_lpad` FROM `user` WHERE `address` = '" + ws.owner + "');");
                    }
                    if (decode.tab === 'jackpot_bw') {
                        leader_board_users = await mysql_query(mysql_connection, "SELECT * FROM `user` ORDER BY `jackpot_bw_lpad` DESC LIMIT 500;");
                        my_self_rank = await mysql_query(mysql_connection, "SELECT COUNT(*)  as rank FROM `user` WHERE `jackpot_bw_lpad` > (SELECT `jackpot_bw_lpad` FROM `user` WHERE `address` = '" + ws.owner + "');");
                    }
                    if (decode.tab === 'points') {
                        leader_board_users = await mysql_query(mysql_connection, "SELECT * FROM `user` ORDER BY `points` DESC LIMIT 500;");
                        my_self_rank = await mysql_query(mysql_connection, "SELECT COUNT(*)   as rank FROM `user` WHERE `points` > (SELECT `points` FROM `user` WHERE `address` = '" + ws.owner + "');");
                    }

                    ws.send(JSON.stringify({
                        method: "GetLeaderBoardSuccess",
                        tab: decode.tab,
                        my_self_rank: my_self_rank[0].rank + 1,
                        users: leader_board_users
                    }));
                    break;
                case "GetExtractPurchaseLog":
                    let extract_log = await mysql_query(mysql_connection, "SELECT * FROM `extract` WHERE `address` = '" + ws.owner + "' ORDER BY `create_time` DESC LIMIT 100;");
                    let purchase_log = await mysql_query(mysql_connection, "SELECT * FROM `purchase` WHERE `owner` = '" + ws.owner + "' ORDER BY `create_time` DESC LIMIT 100;");
                    ws.send(JSON.stringify({
                        method: "GetExtractPurchaseLogSuccess",
                        extract_log: extract_log,
                        purchase_log: purchase_log
                    }));
                    break;
            }
        } catch (e) {
            console.error(e);
        }
    });

    // 当连接关闭时触发
    ws.on('close', () => {
        logger.info(`websocket connection close id=${ws.id} addr=${ws._socket.remoteAddress} port=${ws._socket.remotePort} owner=${ws.owner}`);
        // 从集合中删除离开的客户端
        clients.delete(ws);
    });
});

logger.info('WebSocket chat server is running on port ' + process.env.PORT);
logger.info('Process ID: ' + process.pid);
