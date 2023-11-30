import WebSocket, {WebSocketServer} from 'ws';

const ws = new WebSocket('ws://127.0.0.1:3000');

ws.on('error', console.error);

ws.on('open', function open() {
    console.log("open");

    ws.send(JSON.stringify({
        method: "StartGame"
    }));
});