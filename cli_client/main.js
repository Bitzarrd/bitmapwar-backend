import WebSocket, {WebSocketServer} from 'ws';

const ws = new WebSocket('ws://34.225.3.60:3000');

ws.on('error', console.error);

ws.on('message', function message(data) {
    console.log('received: %s', data);
});

ws.on('open', function open() {
    console.log("open");

    ws.send(JSON.stringify({
        method: "StartGame"
    }));


});