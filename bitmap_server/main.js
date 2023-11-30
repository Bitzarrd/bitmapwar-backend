import {generate2DArray} from 'bitmap_sdk';
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
                let x = Math.random() % gridWidth;
                let y = Math.random() % gridHeight;
                let index = players.length;
                let color = colors[index % colors.length];
                grid[x][y] = color;
                let player = {
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