import pino from 'pino';

import { env } from '@/shared/config/env';

/**
 * Application-wide structured logger.
 *
 * - Pretty-printed in development (`PINO_PRETTY=true`), JSON in production.
 * - Use `logger.child({ module: 'auth' })` per-module for traceable logs.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'password',
      'newPassword',
      'currentPassword',
      'authorization',
      '*.password',
      '*.token',
      '*.secret',
      'req.headers.cookie',
      'req.headers.authorization',
    ],
    censor: '[REDACTED]',
  },
  ...(env.PINO_PRETTY && env.NODE_ENV !== 'production'
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, singleLine: true, translateTime: 'SYS:standard' },
        },
      }
    : {}),
});

export type AppLogger = typeof logger;
