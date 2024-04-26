wss://dev-server.bitmapwar.com/api


# Install
sudo apt update
sudo apt install nodejs
sudo apt install ts-node
sudo apt install node-typescript

cd /mnt/d/robot
npm install .

# Run

ts-node ./src/batch_join.ts -ws wss://dev-server.bitmapwar.com/api  -s 1 -a ./pubk.txt -c red

