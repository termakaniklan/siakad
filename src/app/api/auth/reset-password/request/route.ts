import { NextResponse } from 'next/server';
import { z } from 'zod';

import { issueResetToken } from '@/modules/auth/reset-token';
import { sendEmail } from '@/modules/notification/email-driver';
import { env } from '@/shared/config/env';
import { prisma } from '@/shared/db/prisma';
import { logger } from '@/shared/logger';
import { rateLimit } from '@/shared/security/rate-limit';

/**
 * POST /api/auth/reset-password/request — start the reset flow.
 *
 * Always responds 200 (no user enumeration). If the identifier matches an
 * existing user we issue a 15-minute signed token, embed it in a link, and
 * send an email. SMTP failures are absorbed (logged) so an attacker cannot
 * confirm whether the email was deliverable.
 */
const requestSchema = z.object({
  identifier: z.string().min(1).max(160),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true }); // do not leak parsing failure
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: true });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0';
  const limit = await rateLimit(`pwreset:req:${ip}`, 5, 600).catch(() => ({ allowed: true }));
  if (!limit.allowed) return NextResponse.json({ ok: true });

  const id = parsed.data.identifier.trim();
  const user = await prisma.user
    .findFirst({
      where: { OR: [{ email: id }, { username: id }], isActive: true, deletedAt: null },
      select: { id: true, email: true, fullName: true },
    })
    .catch(() => null);
  if (user) {
    try {
      const token = await issueResetToken(user.id);
      const url = `${env.APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
      await sendEmail({
        to: user.email,
        subject: 'Reset Password SIAKAD',
        html: `<p>Halo ${user.fullName},</p>
<p>Klik tautan berikut untuk mengatur ulang password Anda. Tautan berlaku 15 menit.</p>
<p><a href="${url}">${url}</a></p>
<p>Jika Anda tidak meminta reset password, abaikan email ini.</p>`,
      });
      await prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: 'auth.password.reset.requested',
          entityType: 'User',
          entityId: user.id,
          ip,
        },
      });
    } catch (err) {
      logger.warn({ err: String(err), userId: user.id }, 'reset_password.email_failed');
    }
  }
  return NextResponse.json({ ok: true });
}
