import { getQueue, QUEUES } from '@/shared/queue';

import type { NotificationJobPayload } from '@/modules/notification/types';

/** Enqueue a notification for asynchronous delivery. */
export async function enqueueNotification(payload: NotificationJobPayload): Promise<void> {
  const queue = getQueue(QUEUES.NOTIFICATIONS);
  await queue.add('send', payload);
}
