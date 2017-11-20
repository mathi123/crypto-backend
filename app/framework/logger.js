const winston = require('winston');
const Logger = winston.Logger;

const logger = new Logger({
    'level': 'verbose',
});
const consoleTransport = winston.transports.Console;
logger.add(consoleTransport, { colorize: true, timestamp: true });

module.exports = logger;
