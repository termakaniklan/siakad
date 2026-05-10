import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getPrincipal } from '@/modules/auth/principal';
import { PERMISSIONS } from '@/modules/rbac/permissions';
import { hasAnyPermission } from '@/modules/rbac/policy';
import { prisma } from '@/shared/db/prisma';
import { audit } from '@/shared/security/audit';
import { sanitizeHtml } from '@/shared/security/sanitize';

const idSchema = z.string().uuid();

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  body: z.string().min(1).max(8_000).optional(),
  audience: z.string().min(1).max(64).optional(),
  isPinned: z.boolean().optional(),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
});

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const principal = await getPrincipal();
  if (!hasAnyPermission(principal, PERMISSIONS.CMS_ANNOUNCEMENT_MANAGE)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const idCheck = idSchema.safeParse(ctx.params.id);
  if (!idCheck.success) return NextResponse.json({ ok: false }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const data: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.body !== undefined) data.body = sanitizeHtml(parsed.data.body, 'richText');
  if (parsed.data.audience !== undefined) data.audience = parsed.data.audience;
  if (parsed.data.isPinned !== undefined) data.isPinned = parsed.data.isPinned;
  if (parsed.data.expiresAt !== undefined)
    data.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
  const updated = await prisma.announcement.update({ where: { id: idCheck.data }, data });
  await audit({
    actorUserId: principal!.userId,
    action: 'admin.announcement.update',
    entityType: 'Announcement',
    entityId: idCheck.data,
  });
  return NextResponse.json({ ok: true, announcement: updated });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const principal = await getPrincipal();
  if (!hasAnyPermission(principal, PERMISSIONS.CMS_ANNOUNCEMENT_MANAGE)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const idCheck = idSchema.safeParse(ctx.params.id);
  if (!idCheck.success) return NextResponse.json({ ok: false }, { status: 400 });
  await prisma.announcement.update({
    where: { id: idCheck.data },
    data: { deletedAt: new Date() },
  });
  await audit({
    actorUserId: principal!.userId,
    action: 'admin.announcement.delete',
    entityType: 'Announcement',
    entityId: idCheck.data,
  });
  return NextResponse.json({ ok: true });
}
