import { NextResponse } from 'next/server';
import { z } from 'zod';

import { verifyResetToken } from '@/modules/auth/reset-token';
import { prisma } from '@/shared/db/prisma';
import { logger } from '@/shared/logger';
import { hashPassword } from '@/shared/security/passwords';
import { rateLimit } from '@/shared/security/rate-limit';

/**
 * POST /api/auth/reset-password/confirm — finalize the reset.
 *
 * Verifies signed token, sets new password (Argon2id), revokes ALL existing
 * sessions for that user, and audit-logs the event.
 */
const confirmSchema = z.object({
  token: z.string().min(20).max(2048),
  newPassword: z.string().min(10, 'Password baru minimal 10 karakter.').max(256),
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0';
  const limit = await rateLimit(`pwreset:cfm:${ip}`, 10, 600).catch(() => ({ allowed: true }));
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, message: 'Terlalu banyak percobaan.' }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload tidak valid.' }, { status: 400 });
  }
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? 'Validasi gagal.' },
      { status: 400 },
    );
  }
  const verified = await verifyResetToken(parsed.data.token);
  if (!verified) {
    return NextResponse.json(
      { ok: false, message: 'Token tidak valid atau kedaluwarsa.' },
      { status: 400 },
    );
  }
  try {
    const hash = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({ where: { id: verified.userId }, data: { passwordHash: hash } });
    await prisma.userSession.updateMany({
      where: { userId: verified.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await prisma.auditLog.create({
      data: {
        actorUserId: verified.userId,
        action: 'auth.password.reset.confirmed',
        entityType: 'User',
        entityId: verified.userId,
        ip,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error({ err }, 'reset_password.confirm_error');
    return NextResponse.json({ ok: false, message: 'Gagal mengubah password.' }, { status: 500 });
  }
}
