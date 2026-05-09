import type { Job } from 'bullmq';

import { sendEmail } from '@/modules/notification/email-driver';
import { sendWhatsApp } from '@/modules/notification/whatsapp-driver';
import type { NotificationJobPayload } from '@/modules/notification/types';
import { prisma } from '@/shared/db/prisma';
import { logger } from '@/shared/logger';

export async function handleNotificationJob(job: Job<NotificationJobPayload>): Promise<void> {
  const data = job.data;
  switch (data.channel) {
    case 'email':
      await sendEmail({ to: data.to, subject: data.subject ?? '(no subject)', html: data.body });
      break;
    case 'wa':
      await sendWhatsApp({ to: data.to, body: data.body });
      break;
    case 'inapp':
      await prisma.notification.create({
        data: {
          userId: data.to,
          channel: 'inapp',
          title: data.subject ?? 'Notifikasi',
          body: data.body,
          data: data.metadata as object | undefined,
        },
      });
      break;
    case 'push':
      // Push delivery is handled in `src/modules/notification/push-driver.ts` (stub).
      logger.info({ to: data.to }, 'push.skipped_stub');
      break;
    default:
      throw new Error(`Unknown channel: ${(data as { channel: string }).channel}`);
  }
}
