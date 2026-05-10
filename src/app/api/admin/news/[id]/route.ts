import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getPrincipal } from '@/modules/auth/principal';
import { PERMISSIONS } from '@/modules/rbac/permissions';
import { hasAnyPermission } from '@/modules/rbac/policy';
import { prisma } from '@/shared/db/prisma';
import { audit } from '@/shared/security/audit';
import { sanitizeHtml } from '@/shared/security/sanitize';

const idSchema = z.string().uuid();

const newsUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  excerpt: z.string().max(280).optional().nullable(),
  content: z.string().min(1).max(64_000).optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  isPublished: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const principal = await getPrincipal();
  if (!hasAnyPermission(principal, PERMISSIONS.CMS_NEWS_MANAGE)) {
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
  const parsed = newsUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const existing = await prisma.newsPost.findUnique({ where: { id: idCheck.data } });
  if (!existing || existing.deletedAt) return NextResponse.json({ ok: false }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.excerpt !== undefined) data.excerpt = parsed.data.excerpt;
  if (parsed.data.content !== undefined)
    data.content = sanitizeHtml(parsed.data.content, 'richText');
  if (parsed.data.coverImageUrl !== undefined) data.coverImageUrl = parsed.data.coverImageUrl;
  if (parsed.data.isPublished !== undefined) {
    data.isPublished = parsed.data.isPublished;
    if (parsed.data.isPublished && !existing.publishedAt) data.publishedAt = new Date();
  }
  const updated = await prisma.newsPost.update({ where: { id: idCheck.data }, data });
  await audit({
    actorUserId: principal!.userId,
    action: 'admin.news.update',
    entityType: 'NewsPost',
    entityId: idCheck.data,
    metadata: parsed.data as Record<string, unknown>,
  });
  return NextResponse.json({ ok: true, post: updated });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const principal = await getPrincipal();
  if (!hasAnyPermission(principal, PERMISSIONS.CMS_NEWS_MANAGE)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const idCheck = idSchema.safeParse(ctx.params.id);
  if (!idCheck.success) return NextResponse.json({ ok: false }, { status: 400 });
  const existing = await prisma.newsPost.findUnique({ where: { id: idCheck.data } });
  if (!existing) return NextResponse.json({ ok: false }, { status: 404 });
  await prisma.newsPost.update({
    where: { id: idCheck.data },
    data: { deletedAt: new Date(), isPublished: false },
  });
  await audit({
    actorUserId: principal!.userId,
    action: 'admin.news.delete',
    entityType: 'NewsPost',
    entityId: idCheck.data,
  });
  return NextResponse.json({ ok: true });
}
