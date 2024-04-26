import {WebSocket} from "ws";
import dotenv from "dotenv";
import winston from "winston";

dotenv.config();


export class RobotClient {
  public pk;

  constructor(pk: string, websocket_url: string) {
    this.pk = pk;

    const myFormat = winston.format.printf(({level, message, timestamp}) => {
      return `${timestamp} ${level} ${pk}: ${message}`;
    });


    const logger = winston.createLogger({
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
      logger.info("connected to websocket server success");


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
          console.log(msg);
          this.send(msg);
        }
        if (message.method === 'LoginSuccess') {
          logger.info(event.toString());
        }
      }
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