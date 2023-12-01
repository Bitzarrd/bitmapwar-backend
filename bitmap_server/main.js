import {generate2DArray, runTurn, getCircleCoordinates, compress2} from 'bitmap_sdk';
import WebSocket, {WebSocketServer} from 'ws';
import winston from "winston";
import dotenv from "dotenv";

dotenv.config();

const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});

// 创建WebSocket服务器实例
const wss = new WebSocketServer({port: process.env.PORT});

// 用于存储连接的客户端
const clients = new Set();

//////////////////////////////////////////////////////
const gridWidth = 300;
const gridHeight = 300;
const colors = ['red', 'blue', 'yellow'];

let grid = generate2DArray(gridWidth, gridHeight);
let players = [];
let interval = null;
let history = [];


function getRandomInt(min, max) {
    min = Math.ceil(min); // 向上取整，确保范围内的最小值为整数
    max = Math.floor(max); // 向下取整，确保范围内的最大值为整数
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const circle = getCircleCoordinates(500)

//////////////////////////////////////////////////////

// 当有新的连接建立时触发
wss.on('connection', (ws) => {
    logger.info("connection")

    // 将新连接的客户端添加到集合中
    clients.add(ws);

    ws.send(JSON.stringify(
        {
            method: "Reload",
            grid: compress2(grid),
            players: players
            // started: started,
        }
    ));

    // 接收消息
    ws.on('message', (message) => {
        logger.info(`Received message: ${message}`);

        let decode = JSON.parse(message);
        switch (decode.method) {
            case "JoinGame":
                let x = getRandomInt(0, gridWidth);
                let y = getRandomInt(0, gridHeight);
                let color = colors[players.length % colors.length];
                console.log(x, y, color);
                grid[x][y] = color;
                let player = {
                    i: 0,
                    x: x,
                    y: y,
                    color: color,
                };
                players.push(player)
                clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            method: "JoinedGame",
                            player: player,
                        }));
                    }
                });
                break;
            case "StartGame":
                logger.info("StartGame");
                // 将消息发送给所有客户端
                clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            method: "GameStarted",
                            gridWidth: gridWidth,
                            gridHeight: gridHeight,

                        }));
                    }
                });


                interval = setInterval(() => {
                    let payload = [];
                    for (let i = 0; i < players.length; i++) {
                        let player = players[i];
                        let {x, y} = runTurn(player, grid, circle);
                        grid[x][y] = i;
                        //drawCell(ctx, cellSize, x, y, player.color);
                        payload.push({
                            x: x,
                            y: y,
                            color: player.color
                        })
                    }


                    clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                method: "Update",
                                payload: payload
                            }));
                        }
                    });
                }, 500)

                break;
            case "StopGame":
                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
                grid = generate2DArray(gridWidth, gridHeight);
                players = [];
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