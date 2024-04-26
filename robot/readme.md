# env
```
    if (window.location.hostname === 'dev.bitmapwar.com') {
        wsUrl = 'wss://dev-server.bitmapwar.com/api';
      } else if (window.location.hostname === 'bitmapwar.com' || window.location.hostname === 'www.bitmapwar.com') {
        wsUrl = 'wss://server.bitmapwar.com/api';
      } else if (window.location.hostname === 'localhost') {
        wsUrl = 'ws://localhost:3000/api';
      } else if (window.location.hostname === 'unity.bitmapwar.com') {
        wsUrl = 'wss://test.bitmapwar.com/api';
      }
```

# Install
sudo apt update
sudo apt install nodejs
sudo apt install ts-node
sudo apt install node-typescript

cd /mnt/d/robot
npm install .

# Run

ts-node ./src/batch_join.ts -ws wss://dev-server.bitmapwar.com/api  -s 1 -a ./pubk.txt -c red

