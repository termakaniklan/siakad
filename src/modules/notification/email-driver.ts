import DOMPurify from 'isomorphic-dompurify';
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

/**
 * Strip HTML to plain text using a real parser instead of a naive regex.
 *
 * A regex like `/<[^>]+>/g` mishandles nested or malformed tags (CodeQL: incomplete
 * multi-character sanitization). DOMPurify with `ALLOWED_TAGS: []` produces a safe
 * text representation regardless of input shape.
 */
function htmlToPlainText(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], KEEP_CONTENT: true });
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
    text: opts.text ?? htmlToPlainText(opts.html),
    html: opts.html,
  });
}
