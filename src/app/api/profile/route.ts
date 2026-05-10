import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getPrincipal } from '@/modules/auth/principal';
import { prisma } from '@/shared/db/prisma';
import { logger } from '@/shared/logger';

/**
 * PATCH /api/profile — every authenticated user can update **their own** profile.
 *
 * IDOR-proof: the user being updated is *always* `principal.userId`, never read
 * from the request body. Email/username changes are blocked here (they require
 * admin involvement) to avoid identity hijacking.
 */
const profilePatchSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z
    .string()
    .max(32)
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export async function PATCH(req: Request) {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ ok: false }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload tidak valid.' }, { status: 400 });
  }
  const parsed = profilePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? 'Validasi gagal.' },
      { status: 400 },
    );
  }
  try {
    await prisma.user.update({
      where: { id: principal.userId },
      data: { fullName: parsed.data.fullName, phone: parsed.data.phone ?? null },
    });
    await prisma.auditLog.create({
      data: {
        actorUserId: principal.userId,
        action: 'profile.update',
        entityType: 'User',
        entityId: principal.userId,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error({ err }, 'profile.update.error');
    return NextResponse.json({ ok: false, message: 'Gagal menyimpan.' }, { status: 500 });
  }
}
