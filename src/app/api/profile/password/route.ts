import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getPrincipal } from '@/modules/auth/principal';
import { prisma } from '@/shared/db/prisma';
import { logger } from '@/shared/logger';
import { hashPassword, verifyPassword } from '@/shared/security/passwords';
import { rateLimit } from '@/shared/security/rate-limit';

/**
 * POST /api/profile/password — change the *current* user's password.
 *
 * Defense-in-depth:
 * - Authenticated principal required.
 * - Old password verified before write (Argon2id, constant-time).
 * - Per-user rate limit: 5 attempts/minute.
 * - Audit logged + all other sessions are evicted on success so a stolen cookie
 *   cannot survive a password change.
 */
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1).max(256),
  newPassword: z.string().min(10, 'Password baru minimal 10 karakter.').max(256),
});

export async function POST(req: Request) {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ ok: false }, { status: 401 });

  const limit = await rateLimit(`pwchange:${principal.userId}`, 5, 60).catch(() => ({
    allowed: true,
  }));
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: 'Terlalu banyak percobaan. Coba sebentar lagi.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload tidak valid.' }, { status: 400 });
  }
  const parsed = passwordChangeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? 'Validasi gagal.' },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: principal.userId },
    select: { id: true, passwordHash: true },
  });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ ok: false, message: 'Akun tidak valid.' }, { status: 400 });
  }
  const ok = await verifyPassword(user.passwordHash, parsed.data.currentPassword);
  if (!ok) {
    return NextResponse.json({ ok: false, message: 'Password lama salah.' }, { status: 400 });
  }
  try {
    const newHash = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({
      where: { id: principal.userId },
      data: { passwordHash: newHash },
    });
    // Evict all sessions OTHER than the current one.
    await prisma.userSession.updateMany({
      where: { userId: principal.userId, id: { not: principal.sessionId } },
      data: { revokedAt: new Date() },
    });
    await prisma.auditLog.create({
      data: {
        actorUserId: principal.userId,
        action: 'profile.password.change',
        entityType: 'User',
        entityId: principal.userId,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error({ err }, 'profile.password.error');
    return NextResponse.json({ ok: false, message: 'Gagal mengubah.' }, { status: 500 });
  }
}
