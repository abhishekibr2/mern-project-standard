/**
 * Logging utility
 * Winston logger configuration following FANG standards
 */

const winston = require('winston');
const config = require('../config');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which logs to print based on environment
const level = () => {
  const env = config.env || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : config.logging.level;
};

// Define different log formats
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: config.env === 'production' ? prodFormat : devFormat,
  }),
];

// Add file transports for production
if (config.env === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: prodFormat,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: prodFormat,
    }),
  );
}

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: config.env === 'production' ? prodFormat : devFormat,
  transports,
  exitOnError: false,
});

// Handle uncaught exceptions and rejections
logger.exceptions.handle(
  new winston.transports.File({ filename: 'logs/exceptions.log' })
);

logger.rejections.handle(
  new winston.transports.File({ filename: 'logs/rejections.log' })
);

// Create a stream object for Morgan HTTP logging middleware
logger.stream = {
  write: function(message) {
    logger.http(message.trim());
  },
};

module.exports = logger;
