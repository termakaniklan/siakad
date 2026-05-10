import { NextResponse } from 'next/server';

import { getPrincipal } from '@/modules/auth/principal';
import { prisma } from '@/shared/db/prisma';
import { logger } from '@/shared/logger';
import { rateLimit } from '@/shared/security/rate-limit';
import { MAX_AVATAR_BYTES, saveImage } from '@/shared/storage/local';

/**
 * POST /api/profile/avatar — multipart upload that updates the **current** user's
 * `User.avatarUrl`. Validates magic-bytes (no MIME spoofing), 2 MB cap, and
 * limits to 5 uploads per minute per user.
 */
export async function POST(req: Request) {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ ok: false }, { status: 401 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0';
  const limit = await rateLimit(`upload:avatar:${principal.userId}`, 5, 60).catch(() => ({
    allowed: true,
  }));
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: 'Terlalu banyak upload. Coba sebentar lagi.' },
      { status: 429 },
    );
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false, message: 'Form tidak valid.' }, { status: 400 });
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: 'File wajib diunggah.' }, { status: 400 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  try {
    const saved = await saveImage('avatars', buf, {
      maxBytes: MAX_AVATAR_BYTES,
      allowed: ['png', 'jpg', 'webp', 'gif'],
    });
    await prisma.user.update({
      where: { id: principal.userId },
      data: { avatarUrl: saved.url },
    });
    await prisma.auditLog.create({
      data: {
        actorUserId: principal.userId,
        action: 'profile.avatar.update',
        entityType: 'User',
        entityId: principal.userId,
        ip,
        metadata: { url: saved.url, bytes: saved.bytes, kind: saved.kind },
      },
    });
    return NextResponse.json({ ok: true, url: saved.url });
  } catch (err) {
    logger.warn({ err: String(err) }, 'profile.avatar.invalid');
    const message =
      err instanceof Error && err.message === 'file_too_large'
        ? 'Ukuran file melebihi 2 MB.'
        : err instanceof Error && err.message === 'unsupported_image'
          ? 'Hanya PNG/JPG/WebP/GIF yang didukung.'
          : 'Gagal menyimpan foto.';
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
