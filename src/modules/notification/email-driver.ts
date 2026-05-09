import nodemailer, { type Transporter } from 'nodemailer';

import { env } from '@/shared/config/env';

let transporter: Transporter | null = null;

export function getMailTransport(): Transporter {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: env.MAIL_SECURE,
    auth:
      env.MAIL_USER && env.MAIL_PASSWORD
        ? { user: env.MAIL_USER, pass: env.MAIL_PASSWORD }
        : undefined,
  });
  return transporter;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const t = getMailTransport();
  await t.sendMail({
    from: env.MAIL_FROM,
    to: opts.to,
    subject: opts.subject,
    text: opts.text ?? opts.html.replace(/<[^>]+>/g, ''),
    html: opts.html,
  });
}
