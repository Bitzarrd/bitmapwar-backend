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
  .requiredOption('-a, --accounts <string>', 'accounts file path')
  .requiredOption('-d, --days <number>', 'days')
  .requiredOption('-t, --type <string>', 'type: energy or profit')
  .requiredOption('-ws, --websocket_url <string>', 'websocket server');

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
  const public_keys = load_public_key_array_from_path(options.accounts);

  for (let i = 0; i < public_keys.length; i++) {
    logger.info("public key: " + public_keys[i]);
    new RobotClient(public_keys[i], options.websocket_url, (Number)(options.days), options.type);
  }

  await sleep(100 * 1000);

}

const sleep = async function (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class RobotClient {
  public pk;
  public days;
  public rent_type;

  constructor(pk: string, websocket_url: string, days: number, rent_type: string) {
    this.pk = pk;
    this.days = days;
    this.rent_type = rent_type;
    const myFormat = winston.format.printf(({level, message, timestamp}) => {
      return `${timestamp} ${level} ${pk}: ${message}`;
    });


    const my_logger = winston.createLogger({
      transports: [new winston.transports.Console()],
      level: "debug",
      defaultMeta: {service: 'user-service'},
      format: winston.format.combine(
        winston.format.timestamp(),
        myFormat
      ),
    });

    const websocket_client = new WebSocket(websocket_url);

    websocket_client.addListener('open', () => {
      my_logger.info("connected to websocket server success");


    });

    websocket_client.on('message', function (event) {
      // console.log();
      // const json_str =  event.
      // logger.info('Received message from server:' + event.toString());
      let message = JSON.parse(event.toString())
      {
        if (message.method === 'Reload') {
          const msg = JSON.stringify({
            method: "Login",
            address: pk
          });
          // console.log(msg);
          this.send(msg);
        } else if (message.method === 'LoginSuccess') {
          my_logger.info(event.toString());
          const random = Math.floor(Math.random() * 800000);
          this.send(JSON.stringify({
            method: "RentBitmap",
            map_id: random,
            type: rent_type,
            day: days
          }));
        } else if (message.method === 'RentBitmapSuccess') {
          my_logger.info(event.toString());
        } else {
          // my_logger.debug('Received message from server:' + event.toString());
        }
      }
    });

// Connection closed
    websocket_client.on('close', function (event) {
      my_logger.info('Disconnected from the WebSocket server');
    });

// Error occurred
    websocket_client.on('error', function (event) {
      my_logger.error('WebSocket error:' + event);
    });

  }
}

main().then(r => {
  logger.info("finish");
});