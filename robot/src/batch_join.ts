import winston = require('winston');
import dotenv = require("dotenv");


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

const main = async () => {
  console.log("start");
}

main().then(r => {
  logger.info("finish");
});