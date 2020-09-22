const winston = require('winston');
const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(info => {
    return `${new Date(info.timestamp).toLocaleString()} ${info.level}: ${info.message}`
});

var currentDate = new Date();
var utcTime = currentDate.getTime() + (currentDate.getTimezoneOffset() * 60000);
var timeOffset = 12;
var BulgariaTime = new Date(utcTime + (3600000 * timeOffset)).toJSON().slice(0,10);

var winstonLogLevel = process.env.NODE_ENV ? 'error' : 'info';
var winstonTransport = process.env.NODE_ENV
    ? new winston.transports.Console()
    : new winston.transports.File({ filename: `./logs/server_${BulgariaTime}.log` });

const logger = module.exports = winston.createLogger({
    level: winstonLogLevel,
    format: combine(
        winston.format.splat(),
        timestamp(),
        myFormat
    ),
    transports: [
        winstonTransport,
    ],
    exceptionHandlers: [
        winstonTransport,
    ],
    exitOnError: false
});
