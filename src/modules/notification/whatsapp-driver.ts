import { env } from '@/shared/config/env';
import { logger } from '@/shared/logger';

/**
 * WhatsApp driver — provider-agnostic façade.
 *
 * Concrete adapters (Meta Cloud API, Twilio, Fonnte) live behind `WA_PROVIDER`. The
 * default `disabled` provider just logs the call so dev environments don't fail.
 */
export interface WhatsAppMessage {
  to: string;
  body: string;
}

export async function sendWhatsApp(msg: WhatsAppMessage): Promise<void> {
  if (env.WA_PROVIDER === 'disabled') {
    logger.info({ to: msg.to }, 'wa.disabled.simulated_send');
    return;
  }
  if (!env.WA_API_URL || !env.WA_API_KEY) {
    logger.warn({ provider: env.WA_PROVIDER }, 'wa.missing_credentials');
    return;
  }
  const res = await fetch(env.WA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.WA_API_KEY}`,
    },
    body: JSON.stringify({
      sender: env.WA_SENDER_ID,
      to: msg.to,
      message: msg.body,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    logger.error({ status: res.status, text }, 'wa.send_failed');
    throw new Error(`WhatsApp send failed: HTTP ${res.status}`);
  }
}
