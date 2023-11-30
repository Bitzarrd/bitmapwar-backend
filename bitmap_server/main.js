import {generate2DArray, runTurn} from 'bitmap_sdk';
import WebSocket, {WebSocketServer} from 'ws';
import winston from "winston";

const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});

// 创建WebSocket服务器实例
const wss = new WebSocketServer({port: 3000});

// 用于存储连接的客户端
const clients = new Set();

//////////////////////////////////////////////////////
const gridWidth = 300;
const gridHeight = 300;
const grid = generate2DArray(gridWidth, gridHeight);
const colors = ['red', 'blue', 'yellow'];
let players = [];

function getRandomInt(min, max) {
    min = Math.ceil(min); // 向上取整，确保范围内的最小值为整数
    max = Math.floor(max); // 向下取整，确保范围内的最大值为整数
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


console.log(grid);

//////////////////////////////////////////////////////

// 当有新的连接建立时触发
wss.on('connection', (ws) => {
    logger.info("connection")

    // 将新连接的客户端添加到集合中
    clients.add(ws);

    // 接收消息
    ws.on('message', (message) => {
        logger.info(`Received message: ${message}`);

        let decode = JSON.parse(message);
        switch (decode.method) {
            case "JoinGame":
                let x = getRandomInt(0, gridWidth);
                let y = getRandomInt(0, gridHeight);
                let index = players.length;
                let color = colors[index % colors.length];
                console.log(x, y, color);
                grid[x][y] = color;
                let player = {
                    i: 0,
                    x: x,
                    y: y,
                    color: color,
                    circle: getCircleCoordinates(500)
                };
                players.push(player)
                clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            method: "JoinedGame",
                            player: player,
                            index: index
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


                setInterval(() => {
                    let payload = [];
                    players.forEach(player => {
                        let {x, y} = runTurn(player, grid);
                        grid[x][y] = player.color;
                        //drawCell(ctx, cellSize, x, y, player.color);
                        payload.push({
                            x: x,
                            y: y,
                            color: color
                        })
                    });


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

logger.info('WebSocket chat server is running on port 3000');