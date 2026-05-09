export type NotificationChannel = 'email' | 'wa' | 'inapp' | 'push';

export interface NotificationJobPayload {
  channel: NotificationChannel;
  to: string; // email / phone / userId depending on channel
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
}
