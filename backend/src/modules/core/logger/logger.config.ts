import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { join } from 'path';

// Function to create a transport with rotation
const createRotateTransport = (
  filename: string,
  level: string,
): DailyRotateFile => {
  return new DailyRotateFile({
    filename: join(process.cwd(), 'logs', filename),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true, // Compress old logs
    maxSize: '20m', // Max file size: 20MB
    maxFiles: '14d', // Keep logs for 14 days
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
  });
};

export const createWinstonConfig = () => {
  const transports: winston.transport[] = [];

  // Console transport
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('FodmapFacile', {
          colors: true,
          prettyPrint: true,
          processId: true,
          appName: true,
        }),
      ),
    }),
  );

  /**
   * File transports with automatic rotation
   * --
   * Winston uses log level hierarchy where each level includes all levels above it (higher priority):
   *   - error: 0 (highest priority)
   *   - warn: 1
   *   - info: 2
   *   - debug: 5
   *
   * When you set level: 'warn', that transport will log messages at warn level and above (i.e., warn + error).
   */
  transports.push(
    // All logs
    createRotateTransport('combined-%DATE%.log', 'debug'),

    // Only errors & warnings
    createRotateTransport('warn-%DATE%.log', 'warn'),
  );

  return {
    transports,
    exceptionHandlers: [
      // Capture unhandled exceptions
      createRotateTransport('exceptions-%DATE%.log', 'error'),
    ],
    rejectionHandlers: [
      // Capture unhandled rejections
      createRotateTransport('rejections-%DATE%.log', 'error'),
    ],
  };
};
