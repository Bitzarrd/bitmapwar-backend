import winston from 'winston';
import dotenv from "dotenv";
import {program} from 'commander';
import {WebSocket} from 'ws';
import * as fs from "node:fs";

dotenv.config();

const myFormat = winston.format.printf(({level, message, timestamp}) => {
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

program
  .option('-a, --accounts <string>', 'accounts file path')
  .option('-s, --soldier <number>', 'soldier amount number')
  .option('-ws, --websocket_url <string>', 'websocket server');

program.parse();

const options = program.opts();
// const limit = options.a ? 1 : undefined;
// console.log(program.args[0].split(options.separator, limit));

function load_public_key_array_from_path(path: string) {
  const public_key_array = fs.readFileSync(path).toString().split("\n");
  return public_key_array;
}

const main = async () => {
  console.log(options);
  if (typeof options.websocket_url === 'undefined') {
    logger.error("websocket url is required");
    return;
  }
  if (typeof options.soldier === 'undefined') {
    logger.error("soldier is required");
    return;
  }


  // logger.info("websocket url: " + options.websocket_url);
  const public_keys = load_public_key_array_from_path(options.accounts);

  for (let i = 0; i < public_keys.length; i++) {
    const websocket_client = new WebSocket(options.websocket_url);
    websocket_client.on('open', function open() {
      logger.info("connected to websocket server success");

    });

    websocket_client.on('message', function (event) {
      console.log(event);
      logger.info('Received message from server:');
    });

// Connection closed
    websocket_client.on('close', function (event) {
      logger.info('Disconnected from the WebSocket server');
    });

// Error occurred
    websocket_client.on('error', function (event) {
      logger.error('WebSocket error:' + event);
    });
  }


}

main().then(r => {
  logger.info("finish");
});