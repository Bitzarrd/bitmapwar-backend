import winston from "winston";

const myFormat = winston.format.printf(({level, message, label, timestamp}) => {
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

logger.debug("Debug message")