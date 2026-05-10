import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getPrincipal } from '@/modules/auth/principal';
import { setBranding } from '@/modules/branding/service';
import { ROLES } from '@/modules/rbac/permissions';
import { prisma } from '@/shared/db/prisma';
import { logger } from '@/shared/logger';
import { saveImage, MAX_BG_BYTES } from '@/shared/storage/local';

/**
 * Admin-only branding endpoints.
 *
 *  - PATCH `/api/admin/branding` — update title / primary color (JSON).
 *  - POST  `/api/admin/branding` — multipart upload (`field` = 'favicon' |
 *    'logo' | 'loginBackground'), file is validated for magic-bytes & saved
 *    under `public/uploads/branding/`.
 *
 * Defense:
 *  - Hard role check (super_admin / admin only) at the top of every handler.
 *  - Field name is whitelisted; never reflected back as filename.
 *  - All writes are audit-logged.
 */
function isAdmin(roleCodes: ReadonlyArray<string>): boolean {
  return roleCodes.some((c) => [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(c as never));
}

const patchSchema = z.object({
  siteTitle: z.string().min(1).max(120).nullable().optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Warna harus berformat hex #RRGGBB.')
    .nullable()
    .optional(),
});

export async function PATCH(req: Request) {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ ok: false }, { status: 401 });
  if (!isAdmin(principal.roleCodes)) return NextResponse.json({ ok: false }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload tidak valid.' }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? 'Validasi gagal.' },
      { status: 400 },
    );
  }
  try {
    const next = await setBranding({
      siteTitle: parsed.data.siteTitle ?? null,
      primaryColor: parsed.data.primaryColor ?? null,
    });
    await prisma.auditLog.create({
      data: {
        actorUserId: principal.userId,
        action: 'admin.branding.update',
        entityType: 'Setting',
        entityId: 'branding',
        metadata: parsed.data as object,
      },
    });
    return NextResponse.json({ ok: true, branding: next });
  } catch (err) {
    logger.error({ err }, 'admin.branding.error');
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

const FIELD_TO_BUCKET: Record<
  string,
  {
    bucket: string;
    allowed: ReadonlyArray<'png' | 'jpg' | 'webp' | 'ico' | 'svg' | 'gif'>;
    max: number;
  }
> = {
  favicon: { bucket: 'branding', allowed: ['png', 'ico', 'svg'], max: 256 * 1024 },
  logo: { bucket: 'branding', allowed: ['png', 'jpg', 'webp', 'svg'], max: 1024 * 1024 },
  loginBackground: { bucket: 'branding', allowed: ['jpg', 'png', 'webp'], max: MAX_BG_BYTES },
};

export async function POST(req: Request) {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ ok: false }, { status: 401 });
  if (!isAdmin(principal.roleCodes)) return NextResponse.json({ ok: false }, { status: 403 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false, message: 'Form tidak valid.' }, { status: 400 });
  const field = form.get('field');
  const file = form.get('file');
  if (typeof field !== 'string' || !FIELD_TO_BUCKET[field]) {
    return NextResponse.json({ ok: false, message: 'Field tidak dikenal.' }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: 'File wajib diunggah.' }, { status: 400 });
  }
  const cfg = FIELD_TO_BUCKET[field]!;
  const buf = Buffer.from(await file.arrayBuffer());
  try {
    const saved = await saveImage(cfg.bucket, buf, {
      maxBytes: cfg.max,
      allowed: cfg.allowed,
    });
    const branding = await setBranding(
      field === 'favicon'
        ? { faviconUrl: saved.url }
        : field === 'logo'
          ? { logoUrl: saved.url }
          : { loginBackgroundUrl: saved.url },
    );
    await prisma.auditLog.create({
      data: {
        actorUserId: principal.userId,
        action: 'admin.branding.upload',
        entityType: 'Setting',
        entityId: 'branding',
        metadata: { field, url: saved.url, bytes: saved.bytes, kind: saved.kind },
      },
    });
    return NextResponse.json({ ok: true, branding, url: saved.url });
  } catch (err) {
    logger.warn({ err: String(err), field }, 'admin.branding.invalid_upload');
    const message =
      err instanceof Error && err.message === 'file_too_large'
        ? 'Ukuran file melebihi batas.'
        : err instanceof Error && err.message === 'unsupported_image'
          ? 'Format file tidak didukung.'
          : 'Gagal menyimpan.';
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
