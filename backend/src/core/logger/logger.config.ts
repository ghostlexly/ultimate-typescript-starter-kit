import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { join } from 'path';

// Fonction pour créer un transport avec rotation
const createRotateTransport = (
  filename: string,
  level: string,
): DailyRotateFile => {
  return new DailyRotateFile({
    filename: join(process.cwd(), 'logs', filename),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true, // Compresser les anciens logs
    maxSize: '20m', // Taille max d'un fichier: 20MB
    maxFiles: '14d', // Garder les logs pendant 14 jours
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

  // Console transport pour le développement
  if (process.env.NODE_ENV !== 'production') {
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
  }

  // File transports avec rotation automatique
  transports.push(
    // Tous les logs
    createRotateTransport('combined-%DATE%.log', 'info'),

    // Seulement les erreurs
    createRotateTransport('error-%DATE%.log', 'error'),

    // Seulement les warnings
    createRotateTransport('warn-%DATE%.log', 'warn'),

    // Seulement les debug
    createRotateTransport('debug-%DATE%.log', 'debug'),
  );

  return {
    transports,
    exceptionHandlers: [
      // Capturer les exceptions non gérées
      createRotateTransport('exceptions-%DATE%.log', 'error'),
    ],
    rejectionHandlers: [
      // Capturer les promesses rejetées non gérées
      createRotateTransport('rejections-%DATE%.log', 'error'),
    ],
  };
};
