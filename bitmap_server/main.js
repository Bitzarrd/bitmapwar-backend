import {generate2DArray} from 'bitmap_sdk';
import WebSocket, { WebSocketServer } from 'ws';
import winston from "winston";

const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});

// 创建WebSocket服务器实例
const wss = new WebSocketServer({ port: 6000 });

// 用于存储连接的客户端
const clients = new Set();

// 当有新的连接建立时触发
wss.on('connection', (ws) => {
    logger.debug("connection")

    // 将新连接的客户端添加到集合中
    clients.add(ws);

    // 接收消息
    ws.on('message', (message) => {
        logger.debug(`Received message: ${message}`);
        // 将消息发送给所有客户端
        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    // 当连接关闭时触发
    ws.on('close', () => {
        logger.debug("close")
        // 从集合中删除离开的客户端
        clients.delete(ws);
    });
});

logger.info('WebSocket chat server is running on port 6000');