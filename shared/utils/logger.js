const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

/**
 * Create a logger instance for a service
 * @param {string} serviceName - Name of the service
 * @returns {winston.Logger} Logger instance
 */
const createLogger = (serviceName) => {
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: serviceName },
    transports: [
      // Write all logs to console
      new winston.transports.Console({
        format: consoleFormat,
      }),
      // Write all logs with level 'error' and below to error.log
      new DailyRotateFile({
        filename: path.join('logs', `${serviceName}-error-%DATE%.log`),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '14d',
      }),
      // Write all logs to combined.log
      new DailyRotateFile({
        filename: path.join('logs', `${serviceName}-combined-%DATE%.log`),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
      }),
    ],
  });

  return logger;
};

module.exports = createLogger;
