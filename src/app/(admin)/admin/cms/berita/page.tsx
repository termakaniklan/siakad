import { redirect } from 'next/navigation';

import { NewsManager } from '@/components/admin/news-manager';
import { getPrincipal } from '@/modules/auth/principal';
import { PERMISSIONS } from '@/modules/rbac/permissions';
import { hasAnyPermission } from '@/modules/rbac/policy';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminBeritaPage() {
  const principal = await getPrincipal();
  if (!hasAnyPermission(principal, PERMISSIONS.CMS_NEWS_MANAGE)) redirect('/admin');
  const posts = await prisma.newsPost.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      isPublished: true,
      publishedAt: true,
      createdAt: true,
    },
  });
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">Berita</h1>
        <p className="text-sm text-slate-500">
          Kelola artikel berita yang tampil di situs publik. Konten kaya disanitasi sebelum disimpan
          untuk mencegah XSS.
        </p>
      </div>
      <NewsManager
        initialPosts={posts.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          isPublished: p.isPublished,
          publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
          createdAt: p.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
