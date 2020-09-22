const winston = require('winston');
const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(info => {
    return `${new Date(info.timestamp).toLocaleString()} ${info.level}: ${info.message}`
});

var currentDate = new Date();
var utcTime = currentDate.getTime() + (currentDate.getTimezoneOffset() * 60000);
var timeOffset = 12;
var BulgariaTime = new Date(utcTime + (3600000 * timeOffset)).toJSON().slice(0,10);

const logger = module.exports = winston.createLogger({
    level: 'info',
    format: combine(
        winston.format.splat(),
        timestamp(),
        myFormat
    ),
    transports: [
        // new winston.transports.File({ filename: `./logs/server_${BulgariaTime}.log` }),
        new winston.transports.Console(),
    ],
    exceptionHandlers: [
        // new winston.transports.File({ filename: `./logs/exceptions_${BulgariaTime}.log` })
        new winston.transports.Console(),
    ],
    exitOnError: false
});
