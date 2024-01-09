import {generate2DArray, runTurn, getCircleCoordinates, compress2, compress3, compress4} from 'bitmap_sdk';
import WebSocket, {WebSocketServer} from 'ws';
import winston from "winston";
import dotenv from "dotenv";
import axios from "axios";
import mysql from "mysql";
import {getRandomInt, isPrime, isToday, now, simple_player, simple_players} from "./utils.js";
import {gridWidth, colors, durationOfTheMatch, intervalBetweenMatches, circle} from "./defines.js";
import {get_events} from "./get_events.js";
import {make_signature} from "./signature.js";
import {mysql_query} from "./mysql.js";
// import * as circle from "./circle.js";
import {
    calculate_bitmap_reward,
    calculate_pool_1,
    calculate_pool_2, calculate_pool_2_by_color,
    calculate_pool_2_proportion, calculate_virus_to_profit, get_all_init_virus, get_conn_by_owner, get_rank_for_save,
    get_users,
    get_users_by_color,
    get_win_team
} from "./reward.js";
import {calculate_pool_by_color, calculate_proportion, sort_win_team} from "./reward2.0.js";

dotenv.config();

// console.log(circle);

export let mysql_connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB
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

    start_game()
});


// 创建WebSocket服务器实例
const wss = new WebSocketServer({port: process.env.PORT});

// 用于存储连接的客户端
const clients = new Set();

//////////////////////////////////////////////////////

let gridHeight = 800;
let players = [];
let interval = null;
let turn = 0;
let next_round = 0;
let grid = null;
let stop_time = 0;

//////////////////////////////////////////////////////


axios.get("https://global.bitmap.game/service/open/bitmap/count").then(resp => {
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

    return [result.red, result.blue, result.green, result.purple];
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

    axios.get("https://global.bitmap.game/service/open/bitmap/count").then(resp => {
        let map_count = resp.data.data;
        turn = 0;
        gridHeight = Math.ceil(map_count / 1000)
        logger.info(`generate2DArray width=${gridWidth} height=${gridHeight}`);
        grid = generate2DArray(gridWidth, gridHeight);
        stop_time = now() + durationOfTheMatch;

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
                    start_time: now()
                }));
            }
        });

        interval = setInterval(async () => {

            try {
                if (now() === stop_time) {
                    logger.info("stopped on timer")
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
                        return;
                    }

                    const users = get_users(players);
                    // const win_team = get_win_team(players);
                    // logger.info("当前胜利的队伍是：" + win_team);
                    // const win_team_users = get_users_by_color(win_team, users);
                    // logger.info("地块信息：")
                    // for (let player of players) {
                    //     logger.info("地图：" + player.bitmap + " 用户：" + player.owner + " 颜色：" + player.color + " 领地：" + player.land + " 病毒：" + player.virus + " 损失：" + player.loss);
                    // }
                    //
                    // const pool_2 = calculate_pool_2_proportion(win_team_users);
                    // logger.info("奖池2的比例为：" + pool_2);
                    // logger.info("胜利方用户分别是:")
                    // calculate_pool_1(win_team_users);
                    // calculate_pool_2_by_color(win_team_users, win_team);
                    // for (let user of win_team_users) {
                    //     logger.info(
                    //         "用户：" + user.owner +
                    //         " 入场顺序：" + user.i +
                    //         " 名次：" + user.rank +
                    //         " 颜色：" + user.statistics.color +
                    //         " 领地：" + user.statistics.land +
                    //         " 初始化病毒：" + user.init_virus +
                    //         " 当前病毒：" + user.statistics.virus +
                    //         " 损失：" + user.statistics.loss + "" +
                    //         " 奖励1：" + user.reward_1 +
                    //         " 奖励2：" + user.reward_2
                    //     );
                    // }
                    // logger.info("BITMAP持有者奖励为：")
                    // calculate_bitmap_reward(users);
                    // for (let owner of Object.keys(users)) {
                    //     let user = users[owner];
                    //     logger.info("用户：" + user.owner + " 颜色：" + user.statistics.color + " 持有地图：[" + user.bitmaps + "] 奖励为：" + user.reward_3)
                    // }

                    const win_teams = sort_win_team(players);

                    logger.info("地块信息：")
                    for (let player of players) {
                        logger.info("地图：" + player.bitmap + " 用户：" + player.owner + " 颜色：" + player.color + " 领地：" + player.land + " 病毒：" + player.virus + " 损失：" + player.loss);
                    }

                    logger.info("当前的队伍名次是：");
                    for (let win_team of win_teams) {
                        logger.info(win_team.color);
                    }
//
                    const win_team_users_1 = get_users_by_color(win_teams[0].color, users);
                    const win_team_users_2 = get_users_by_color(win_teams[1].color, users);
                    const win_team_users_3 = get_users_by_color(win_teams[2].color, users);

// console.log(win_team_users);

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
                    calculate_pool_by_color(win_team_users_3, win_teams[1].color, proportions[2]);
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
                        let profit = all_reward_profit * BigInt(Math.floor(reward)) / BigInt(100);
                        logger.info("用户：" + owner + " 奖励金额：" + profit.toString() + " 奖励比例：" + reward + "%");
                        user.profit = profit.toString();
                    }
                    last_rank = Object.values(users);

                    //发放奖励
                    for (let owner of Object.keys(users)) {
                        let conn = get_conn_by_owner(players, owner);
                        let user = users[owner];

                        let user_for_settlement = (await mysql_query(mysql_connection, "SELECT * FROM `user` WHERE `address`='" + owner + "';"))[0];
                        user_for_settlement.profit = BigInt(user_for_settlement.profit) + BigInt(user.profit);
                        user_for_settlement.profit = user_for_settlement.profit.toString();
                        await mysql_connection.query("UPDATE user set profit=" + user_for_settlement.profit + " WHERE `address`='" + owner + "';")

                        if (conn) {
                            conn.send(JSON.stringify({
                                method: "Settlement",
                                next_round: next_round,
                                statistics: user.statistics,
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
                        jackpot = jackpot[0].val;
                        logger.info(`当前jackpot总量:${jackpot}`)
                        logger.info(`获得Jackpot中70%的奖励:${jackpot * 0.7}`)
                        let jackpot_reward = jackpot * 0.7;
                        let jackpot_user = await (mysql_query(mysql_connection, "select * from `user` where `address`='" + last_player.owner + "';"))[0];
                        let jackpot_user_profit = BigInt(jackpot_user.profit) + BigInt(jackpot_reward);
                        jackpot_user.profit = jackpot_user_profit.toString();
                        await mysql_connection.query("UPDATE `global` SET `val`=`val`-" + jackpot_reward + " WHERE `key`='jackpot';");
                        await mysql_connection.query("UPDATE `user` SET `profit`=" + jackpot_user_profit + " WHERE `address`='" + last_player.owner + "';");

                        let jackpot_message = {
                            method: "JackpotLightUp",
                            land: win_team.land,
                            jackpot: jackpot_reward,
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


                    const sql = "INSERT INTO `round` (`end_time`,`rank`) VALUES (" + now() + ",'" + JSON.stringify(Object.values(users)) + "')";
                    logger.info(sql);
                    mysql_connection.query(sql, function (err, result) {
                        if (err) {
                            logger.error(err);
                        } else {
                            logger.info("保存排名成功：" + result.insertId);
                        }
                    });

                    //clear
                    players = [];
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

                    return;
                }
            } catch (e) {
                console.log(e)
            }

            try {
                turn++;
                let payload = [];
                for (let i = 0; i < players.length; i++) {
                    let player = players[i];
                    if (player.virus <= 0) {
                        continue;
                    }
                    let {y, x} = runTurn(player, grid, circle);
                    let origin_player_virus = 0;


                    if (grid[y][x] !== 0) {
                        const origin_player_index = grid[y][x];
                        const origin_player = players[origin_player_index - 1];
                        if (origin_player.color !== player.color) {
                            if (origin_player.virus <= 0) {

                            } else {
                                logger.info(`attack!! origin_color=${origin_player.color} now_color=${player.color}`)
                                const damage = Math.min(player.virus, origin_player.virus);
                                origin_player.loss += damage;
                                player.loss += damage;
                                origin_player.virus -= damage;
                                player.virus = damage;
                                if (player.virus <= 0) {
                                    continue;
                                }
                            }
                            origin_player.land--;
                        }
                        // players[origin_player_index - 1].land--;
                        // players[origin_player_index - 1].loss++;

                    }
                    grid[y][x] = i + 1;
                    player.land++;
                    //drawCell(ctx, cellSize, x, y, player.color);
                    payload.push({
                        x: x,
                        y: y,
                        color: player.color,
                    })
                }


                clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            method: "Update",
                            payload: payload,
                            turn: turn,
                            statistics: statistics(),
                        }));
                    }
                });
            } catch (e) {
                console.error(e);
            }
        }, 333)

    })
}


setInterval(() => {
    // logger.info(timestampSeconds + ":" + next_round + ":" + (timestampSeconds === next_round ? "T" : "F"));
    if (now() === next_round) {
        logger.info("Start New Round");
        turn = 0;
        start_game()
    }
}, 1000);

// 当有新的连接建立时触发
wss.on('connection', async (ws) => {
    logger.info("connection")

    // 将新连接的客户端添加到集合中
    clients.add(ws);


    let jackpot = await mysql_query(mysql_connection, "SELECT val FROM `global` WHERE `key`='jackpot';");
    jackpot = jackpot[0].val;

    ws.send(JSON.stringify(
        {
            method: "Reload",
            grid: compress4(grid),
            gridWidth: gridWidth,
            gridHeight: gridHeight,
            players: simple_players(players),
            turn: turn,
            next_round: next_round,
            statistics: statistics(),
            stop_time: stop_time,
            // started: started,
            last_rank: last_rank,
            jackpot: jackpot,
            now_time: now()
        }
    ));

    // 接收消息
    ws.on('message', async (message) => {
        try {
            logger.info(`Received message: ${message}`);
            let decode = JSON.parse(message);
            switch (decode.method) {
                case "Share":

                    if (!decode.owner) {
                        logger.error("owner not set")
                        return;
                    }

                    let last_share = (await mysql_query(mysql_connection, "SELECT * FROM gift WHERE owner='" + decode.owner + "' AND type='share' ORDER BY id DESC LIMIT 1;"))[0];
                    if (last_share) {
                        if (isToday(last_share.create_time)) {
                            return;
                        }
                    }


                    mysql_connection.query("INSERT INTO gift SET ?", {
                        owner: decode.owner,
                        create_time: now(),
                        amount: 500,
                        type: "share"
                    })
                    await mysql_connection.query("UPDATE user SET virus=virus+500 WHERE address='" + decode.owner + "';");
                    let user_for_share = (await mysql_query(mysql_connection, "SELECT * FROM `user` WHERE `address`='" + decode.owner + "';"))[0];
                    ws.send(JSON.stringify({
                        method: "ShareSuccess",
                        user: user_for_share
                    }));
                    break;
                case "Login":
                    const address = decode.address;


                    let has_login_gift = true;
                    let last_login_gift = (await mysql_query(mysql_connection, "SELECT * FROM gift WHERE owner='" + decode.address + "' AND type='login' ORDER BY id DESC LIMIT 1;"))[0];
                    if (last_login_gift) {
                        has_login_gift = isToday(last_login_gift.create_time);
                    } else {
                        has_login_gift = false;
                    }

                    if (!has_login_gift) {
                        await mysql_connection.query("INSERT INTO gift SET ?", {
                            owner: decode.address,
                            create_time: now(),
                            amount: 500,
                            type: "login"
                        });
                        await mysql_connection.query("UPDATE user SET virus=virus+500 WHERE address='" + decode.address + "';");
                    }

                    const sql = "SELECT * FROM `user` WHERE `address`='" + address + "'";
                    logger.info(sql);
                    try {
                        const result = await mysql_query(mysql_connection, sql);
                        if (result.length === 0) {
                            logger.info("new user");


                            try {
                                mysql_connection.query('INSERT INTO user SET ?', {
                                    profit: 1,
                                    address: decode.address,
                                });

                                // const insertResult = await mysql_connection.query(insertSql);
                                // logger.info(insertResult);
                                let user = {
                                    address: address,
                                };
                                ws.send(JSON.stringify({
                                    method: "LoginSuccess",
                                    user: user,
                                    extracts: [],
                                    purchase: [],
                                }));
                            } catch (insertErr) {
                                logger.error(insertErr);
                            }
                        } else {
                            let user = result[0];
                            logger.info(user);

                            let extracts_sql = "SELECT * FROM `extract` WHERE address='" + address + "' ORDER BY id DESC;";
                            logger.info(extracts_sql);
                            let extracts = await mysql_query(mysql_connection, extracts_sql);
                            let purchase = await mysql_query(mysql_connection, "SELECT * FROM `purchase` WHERE owner='" + address + "' ORDER BY id DESC;");

                            ws.send(JSON.stringify({
                                method: "LoginSuccess",
                                user: user,
                                extracts: extracts,
                                purchase: purchase,
                                has_login_gift: has_login_gift
                            }));
                        }
                    } catch (err) {
                        logger.error(err);
                    }

                    break;
                case "JoinGame":
                    // let x = getRandomInt(0, gridWidth);
                    // let y = getRandomInt(0, gridHeight);
                    // let color = colors[players.length % colors.length];
                    // console.log(grid.length, grid[0].length, x, y, color);
                    // grid[y][x] = color;
                    // let player = {
                    //     i: 0,
                    //     x: x,
                    //     y: y,
                    //     color: color,
                    //     land: 0,
                    //     loss: 0,
                    //     virus: 1,
                    //     owner: decode.owner,
                    // };
                    // players.push(player)
                    // clients.forEach((client) => {
                    //     if (client.readyState === WebSocket.OPEN) {
                    //         client.send(JSON.stringify({
                    //             method: "JoinedGame",
                    //             player: player,
                    //         }));
                    //     }
                    // });
                    break;
                case "JoinGame2":
                    let join_y = Math.floor(decode.map_id / gridWidth);
                    let join_x = decode.map_id % gridWidth;
                    logger.info(`JoinGame2 map_id=${decode.map_id} x=${join_x} y=${join_y}`);
                    decode.virus = (Number)(decode.virus);

                    const user_for_join = (await mysql_query(mysql_connection, "SELECT * FROM `user` WHERE `address`='" + decode.owner + "';"))[0];
                    if (user_for_join.virus < decode.virus) {
                        return;
                    }
                    user_for_join.virus -= decode.virus;

                    await mysql_connection.query("UPDATE user SET virus=virus-" + decode.virus + " WHERE address='" + decode.owner + "';");
                    let jackpot = await mysql_query(mysql_connection, "SELECT val FROM `global` WHERE `key`='jackpot';");
                    jackpot = jackpot[0].val;
                    let profit_add_to_jackpot = calculate_virus_to_profit(decode.virus);
                    profit_add_to_jackpot = Math.floor(Number(profit_add_to_jackpot) * 0.1);
                    let new_jackpot = BigInt(jackpot) + BigInt(profit_add_to_jackpot);

                    await mysql_connection.query("UPDATE `global` SET val='" + new_jackpot.toString() + "' WHERE `key`='jackpot';");

                    let join_player = {
                        i: 0,
                        x: join_x,
                        y: join_y,
                        bitmap: decode.map_id,
                        color: decode.color,
                        land: 0,
                        loss: 0,
                        init_virus: decode.virus,
                        virus: decode.virus,
                        owner: decode.owner,
                        conn: ws,
                    };

                    players.push(join_player)

                    clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                method: "JoinedGameSuccess",
                                player: simple_player(join_player),
                                user: user_for_join,
                                jackpot: new_jackpot.toString(),
                            }));
                        }
                    });
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
                        logger.error("tx not found")
                        return;
                    }
                    logger.debug("logs" + tx.events.length)
                    for (let i = 0; i < tx.events.length; i++) {
                        let event = tx.events[i];
                        let event_name = event.signature;
                        switch (event_name) {
                            case "Transfer(address,address,uint256)":
                                let from = event.args[0];
                                let to = event.args[1];
                                let amount = Number(event.args[2]);
                                if (from === "0x0000000000000000000000000000000000000000") {
                                    const sql = "UPDATE `user` SET `virus` = `virus` + " + amount + " WHERE `address` = '" + to + "';";
                                    logger.info(sql);
                                    try {
                                        const result = await mysql_connection.query(sql);
                                        logger.info(result);
                                        const select_sql = "SELECT * FROM `user` WHERE `address` = '" + to + "';";
                                        logger.info(select_sql);
                                        try {
                                            const selectResult = await mysql_query(mysql_connection, select_sql);
                                            logger.info(selectResult);
                                            let user = selectResult[0];
                                            ws.send(JSON.stringify({
                                                method: "PurchaseSuccess",
                                                user: user,
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
                        }
                    }
                    break;
                case "ExtractProfit":

                    let user = (await mysql_query(mysql_connection, "SELECT * FROM `user` WHERE `address` = '" + decode.address + "';"))[0];
                    let profit = BigInt(user.profit);
                    let amount_n = BigInt(decode.amount);
                    if (profit < amount_n) {
                        return
                    }


                    let profit_n = profit - amount_n;


                    console.log(profit_n.toString());
                    user.profit = profit_n.toString();

                    mysql_connection.query("UPDATE user SET profit='" + profit_n.toString() + "' WHERE address='" + decode.address + "';");

                    mysql_connection.query('INSERT INTO extract SET ?', {
                        amount: decode.amount,
                        address: decode.address,
                        create_time: now(),
                    }, async (error, results, fields) => {
                        if (error) throw error;
                        console.log(results.insertId);

                        let signature = await make_signature(process.env.PRIVATE_KEY, decode.amount, results.insertId)
                        logger.info("signature:" + signature);

                        ws.send(JSON.stringify({
                            method: "ExtractProfitSuccess",
                            signature: signature,
                            amount: decode.amount,
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
                    let update_extract_sql = "UPDATE extract SET status=1 AND txid='" + decode.txid + "' WHERE id=" + decode.id + ";";
                    logger.info(update_extract_sql);
                    let update_extract_result = await mysql_connection.query(update_extract_sql);
                    logger.info(update_extract_result);
                    ws.send(JSON.stringify({
                        method: "UpdateExtractSuccess",
                        id: decode.id,
                        txid: decode.txid,
                    }));
                    break;
            }
        } catch (e) {
            console.error(e);
        }
    });

    // 当连接关闭时触发
    ws.on('close', () => {
        logger.debug("close")
        // 从集合中删除离开的客户端
        clients.delete(ws);
    });
});

logger.info('WebSocket chat server is running on port ' + process.env.PORT);