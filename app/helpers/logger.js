const winston = require('winston');
const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(info => {
    return `${new Date(info.timestamp).toLocaleString()} ${info.level}: ${info.message}`
});

const logger = module.exports = winston.createLogger({
    level: 'info',
    format: combine(
        winston.format.splat(),
        timestamp(),
        myFormat
    ),
    transports: [
        new winston.transports.File({ filename: './logs/server.log' })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: './logs/exceptions.log' })
    ],
    exitOnError: false
});
