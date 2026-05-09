import IORedis, { type Redis } from 'ioredis';

import { env } from '@/shared/config/env';
import { logger } from '@/shared/logger';

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

function build(): Redis {
  const client = new IORedis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });
  client.on('error', (err) => logger.warn({ err }, 'redis error'));
  return client;
}

export const redis: Redis = global.__redis ?? build();
if (env.NODE_ENV !== 'production') global.__redis = redis;
