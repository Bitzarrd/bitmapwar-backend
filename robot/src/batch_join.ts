import winston from 'winston';
import dotenv from "dotenv";
import {program} from 'commander';
import {WebSocket} from 'ws';
import * as fs from "node:fs";
import {RobotClient} from "./client";

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
    logger.info("public key: " + public_keys[i]);
    new RobotClient(public_keys[i], options.websocket_url);

  }

  await sleep(100 * 1000);

}

const sleep = async function (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().then(r => {
  logger.info("finish");
});