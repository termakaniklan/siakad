import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getPrincipal } from '@/modules/auth/principal';
import { PERMISSIONS } from '@/modules/rbac/permissions';
import { hasAnyPermission } from '@/modules/rbac/policy';
import { prisma } from '@/shared/db/prisma';
import { audit } from '@/shared/security/audit';
import { sanitizeHtml } from '@/shared/security/sanitize';

const createSchema = z.object({
  title: z.string().min(3).max(200),
  body: z.string().min(1).max(8_000),
  audience: z.string().min(1).max(64).default('all'),
  publishedAt: z
    .string()
    .datetime({ offset: true })
    .optional()
    .or(z.literal('').transform(() => undefined)),
  expiresAt: z
    .string()
    .datetime({ offset: true })
    .optional()
    .or(z.literal('').transform(() => undefined)),
  isPinned: z.boolean().default(false),
});

export async function POST(req: Request) {
  const principal = await getPrincipal();
  if (!hasAnyPermission(principal, PERMISSIONS.CMS_ANNOUNCEMENT_MANAGE)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? 'Validasi gagal.' },
      { status: 400 },
    );
  }
  const announcement = await prisma.announcement.create({
    data: {
      title: parsed.data.title,
      body: sanitizeHtml(parsed.data.body, 'richText'),
      audience: parsed.data.audience,
      publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : new Date(),
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      isPinned: parsed.data.isPinned,
    },
  });
  await audit({
    actorUserId: principal!.userId,
    action: 'admin.announcement.create',
    entityType: 'Announcement',
    entityId: announcement.id,
  });
  return NextResponse.json({ ok: true, announcement });
}
