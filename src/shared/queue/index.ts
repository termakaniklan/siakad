import { Queue, type QueueOptions } from 'bullmq';

import { env } from '@/shared/config/env';

/**
 * BullMQ queue factory.
 *
 * Each module gets its own queue (`notifications`, `payments`, `audit`) so backpressure
 * in one domain does not starve the others.
 */
const baseConnection = { url: env.REDIS_URL };

const defaultOpts: QueueOptions = {
  connection: baseConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 5_000 },
    removeOnComplete: { age: 86_400, count: 1_000 },
    removeOnFail: { age: 7 * 86_400 },
  },
};

const queues = new Map<string, Queue>();

export function getQueue(name: string): Queue {
  let q = queues.get(name);
  if (!q) {
    q = new Queue(name, defaultOpts);
    queues.set(name, q);
  }
  return q;
}

export const QUEUES = {
  NOTIFICATIONS: 'notifications',
  PAYMENTS: 'payments',
  AUDIT: 'audit',
} as const;
