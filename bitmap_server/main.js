import {generate2DArray, runTurn, getCircleCoordinates, compress2, compress3} from 'bitmap_sdk';
import WebSocket, {WebSocketServer} from 'ws';
import winston from "winston";
import dotenv from "dotenv";
import axios from "axios";
import mysql from "mysql";
import {getRandomInt, now} from "./utils.js";
import {gridWidth, colors, durationOfTheMatch, intervalBetweenMatches, circle} from "./defines.js";
import {get_events} from "./get_events.js";
import {make_signature} from "./signature.js";
import {mysql_query} from "./mysql.js";

dotenv.config();

export let mysql_connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB
});

mysql_connection.connect({}, (err) => {
    if (err) {
        logger.error("mysql connect error" + err)
    }
    logger.info("mysql connected")
});


const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    level: "debug",
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


axios.get("https://develop.oasis.world/service/open/bitmap/count").then(resp => {
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
    logger.info("StartGame");

    axios.get("https://develop.oasis.world/service/open/bitmap/count").then(resp => {
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
                    stop_time: stop_time
                }));
            }
        });

    })

    if (interval !== 0) {
        clearInterval(interval);
    }


    interval = setInterval(() => {
        if (now() === stop_time) {
            logger.info("stopped on timer")
            clearInterval(interval);
            next_round = now() + intervalBetweenMatches;

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

            let users = [];


            players.forEach((player) => {
                if (player.conn.readyState === WebSocket.OPEN) {
                    if (users.hasOwnProperty(player.owner)) {
                        users[player.owner].land += player.land;
                        users[player.owner].virus += player.virus;
                        users[player.owner].loss += player.loss;
                    } else {
                        users[player.owner] = {
                            conn: player.conn,
                            statistics: {land: player.land, virus: player.virus, loss: player.loss,}
                        };
                    }
                }
            })

            for (let owner of Object.keys(users)) {
                let user = users[owner];
                if (user.conn.readyState === WebSocket.OPEN) {
                    user.conn.send(JSON.stringify({
                        method: "Settlement",
                        next_round: next_round,
                        rank: rand_to_save,
                        statistics: user.statistics
                    }));
                }
            }


            const sql = "INSERT INTO `round` (`end_time`,`rank`) VALUES (" + now() + ",'" + JSON.stringify(rand_to_save) + "')";
            logger.info(sql);
            mysql_connection.query(sql, function (err, result) {
                console.log(err, result);
            });


            // clients.forEach((client) => {
            //     if (client.readyState === WebSocket.OPEN) {
            //         client.send(JSON.stringify({
            //             method: "Settlement",
            //             next_round: next_round,
            //             rank: rank
            //         }));
            //     }
            // });

            return;
        }

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
    }, 333)

}


setInterval(() => {
    // logger.info(timestampSeconds + ":" + next_round + ":" + (timestampSeconds === next_round ? "T" : "F"));
    if (now() === next_round) {
        logger.info("Start New Round");
        start_game()
    }
}, 1000)
// 当有新的连接建立时触发
wss.on('connection', (ws) => {
    logger.info("connection")

    // 将新连接的客户端添加到集合中
    clients.add(ws);

    ws.send(JSON.stringify(
        {
            method: "Reload",
            grid: compress3(grid),
            gridWidth: gridWidth,
            gridHeight: gridHeight,
            players: players,
            turn: turn,
            next_round: next_round,
            statistics: statistics(),
            stop_time: stop_time
            // started: started,
        }
    ));

    // 接收消息
    ws.on('message', async (message) => {
        logger.info(`Received message: ${message}`);

        let decode = JSON.parse(message);
        switch (decode.method) {
            case "Login":
                const address = decode.address;
                const sql = "SELECT * FROM `user` WHERE `address`='" + address + "'";
                logger.info(sql);
                try {
                    const result = await mysql_query(mysql_connection, sql);
                    if (result.length === 0) {
                        logger.info("new user");
                        const insertSql = "INSERT INTO `user` (`address`) VALUES ('" + address + "')";
                        logger.info(insertSql);
                        try {
                            const insertResult = await mysql_connection.query(insertSql);
                            logger.info(insertResult);
                            let user = {
                                address: address,
                            };
                            ws.send(JSON.stringify({
                                method: "LoginSuccess",
                                user: user,
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

                        ws.send(JSON.stringify({
                            method: "LoginSuccess",
                            user: user,
                            extracts: extracts
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

                let join_player = {
                    i: 0,
                    x: join_x,
                    y: join_y,
                    color: decode.color,
                    land: 0,
                    loss: 0,
                    virus: decode.virus,
                    owner: decode.owner,
                    conn: ws,
                };

                players.push(join_player)

                clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            method: "JoinedGame",
                            player: join_player,
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
                break;
            case "SetNextRound":
                // const timestamp = new Date().getTime();
                // console.log(timestamp);
                next_round = (Number)(decode.timestamp);

                clients.forEach((client) => {
                    client.send(JSON.stringify({
                        method: "SetNextRoundSuccess",
                        timestamp: next_round
                    }));
                });

                break;
            case "Purchase":
                const txid = decode.txid;
                get_events(txid, async (logs) => {
                    console.log("logs", logs);
                    for (let i = 0; i < logs.length; i++) {
                        let log = logs[i];
                        let event_name = log.signature;
                        switch (event_name) {
                            case "Transfer(address,address,uint256)":
                                let from = log.args[0];
                                let to = log.args[1];
                                let amount = Number(log.args[2]);
                                if (from === "0x0000000000000000000000000000000000000000") {
                                    const sql = "UPDATE `user` SET `virus` = `virus` + " + amount + " WHERE `address` = '" + to + "';";
                                    logger.info(sql);
                                    try {
                                        const result = await mysql_connection.query(sql);
                                        logger.info(result);
                                        const select_sql = "SELECT * FROM `user` WHERE `address` = '" + to + "';";
                                        logger.info(select_sql);
                                        try {
                                            const selectResult = await mysql_connection.query(select_sql);
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
                                }
                                break;
                        }
                    }
                });
                break;
            case "ExtractProfit":

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
                        create_time: now()
                    }));

                    await mysql_connection.query("UPDATE extract SET signature='" + signature + "' WHERE id=" + results.insertId + ";")

                });

                // let extract_insert_sql = "INSERT INTO `extract` (`amount`,`address`) VALUES (" + amount + ",'" + decode.address + "');";
                // logger.info(extract_insert_sql);
                // let extract_insert_result = await mysql_connection.query(extract_insert_sql);
                // let extract_insert_id = extract_insert_result.insertId;
                // logger.info("extract_insert_id:" + extract_insert_id);
                break;
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