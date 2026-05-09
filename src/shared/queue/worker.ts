/* eslint-disable no-console */
import { Worker } from 'bullmq';

import { env } from '@/shared/config/env';
import { logger } from '@/shared/logger';
import { QUEUES } from '@/shared/queue';

import { handleNotificationJob } from '@/modules/notification/job-handler';

/**
 * Standalone worker process (run with `npm run queue:worker`).
 *
 * In production: run as a sibling container of the web app, behind the same Redis.
 * Multiple worker replicas are safe — BullMQ dispatch is locked per job.
 */
const connection = { url: env.REDIS_URL };

const notificationWorker = new Worker(QUEUES.NOTIFICATIONS, handleNotificationJob, {
  connection,
  concurrency: 10,
});

notificationWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, queue: QUEUES.NOTIFICATIONS, err }, 'job.failed');
});
notificationWorker.on('completed', (job) => {
  logger.debug({ jobId: job.id, queue: QUEUES.NOTIFICATIONS }, 'job.completed');
});

console.log(`[siakad-worker] notification worker started, redis=${env.REDIS_URL}`);

async function shutdown() {
  await notificationWorker.close();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
