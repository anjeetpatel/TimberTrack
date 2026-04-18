const winston = require('winston');
const path = require('path');
const fs = require('fs');

const LOG_DIR = path.join(__dirname, '../../logs');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const { combine, timestamp, colorize, printf, errors } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    let out = `${timestamp} [${level}] ${message}`;
    if (Object.keys(meta).length) out += ` ${JSON.stringify(meta)}`;
    if (stack) out += `\n${stack}`;
    return out;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json()
);

const isProd = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: isProd ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    ...(isProd
      ? [
          new winston.transports.File({
            filename: path.join(LOG_DIR, 'error.log'),
            level: 'error',
          }),
          new winston.transports.File({
            filename: path.join(LOG_DIR, 'combined.log'),
          }),
        ]
      : []),
  ],
});

module.exports = logger;
