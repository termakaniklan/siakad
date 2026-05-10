import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getPrincipal } from '@/modules/auth/principal';
import { PERMISSIONS } from '@/modules/rbac/permissions';
import { hasAnyPermission } from '@/modules/rbac/policy';
import { prisma } from '@/shared/db/prisma';
import { audit } from '@/shared/security/audit';
import { sanitizeHtml } from '@/shared/security/sanitize';

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);

const newsCreateSchema = z.object({
  title: z.string().min(3).max(200),
  excerpt: z.string().max(280).optional().nullable(),
  content: z.string().min(1).max(64_000),
  coverImageUrl: z
    .string()
    .url()
    .optional()
    .nullable()
    .or(z.literal('').transform(() => null)),
  isPublished: z.boolean().default(false),
});

export async function POST(req: Request) {
  const principal = await getPrincipal();
  if (!hasAnyPermission(principal, PERMISSIONS.CMS_NEWS_MANAGE)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload tidak valid.' }, { status: 400 });
  }
  const parsed = newsCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? 'Validasi gagal.' },
      { status: 400 },
    );
  }
  const baseSlug = slugify(parsed.data.title);
  let slug = baseSlug;
  let suffix = 0;
  while (await prisma.newsPost.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
  const cleanContent = sanitizeHtml(parsed.data.content, 'richText');
  const post = await prisma.newsPost.create({
    data: {
      slug,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt ?? null,
      content: cleanContent,
      coverImageUrl: parsed.data.coverImageUrl ?? null,
      isPublished: parsed.data.isPublished,
      publishedAt: parsed.data.isPublished ? new Date() : null,
      authorId: principal!.userId,
    },
  });
  await audit({
    actorUserId: principal!.userId,
    action: 'admin.news.create',
    entityType: 'NewsPost',
    entityId: post.id,
  });
  return NextResponse.json({ ok: true, post });
}
