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

  // File transports with automatic rotation
  transports.push(
    // All logs
    createRotateTransport('combined-%DATE%.log', 'info'),

    // Only errors
    createRotateTransport('error-%DATE%.log', 'error'),

    // Only warnings
    createRotateTransport('warn-%DATE%.log', 'warn'),

    // Only debug
    createRotateTransport('debug-%DATE%.log', 'debug'),
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
