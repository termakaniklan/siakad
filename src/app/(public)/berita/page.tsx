import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildContentSlug } from '@/lib/utils';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function BeritaIndexPage() {
  const posts = await prisma.newsPost
    .findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: { publishedAt: 'desc' },
      take: 24,
    })
    .catch(() => []);

  return (
    <main className="container py-12">
      <p className="text-sm text-slate-500">
        <Link href="/" className="hover:underline">
          Beranda
        </Link>{' '}
        / Berita
      </p>
      <h1 className="mt-2 text-3xl font-bold">Berita Sekolah</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.length === 0 && (
          <p className="text-slate-500">Belum ada berita yang dipublikasikan.</p>
        )}
        {posts.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.title}</CardTitle>
              <CardDescription>
                {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('id-ID') : '—'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-400">
              <p className="line-clamp-3">{p.excerpt ?? p.content.slice(0, 160)}</p>
              <Link
                className="mt-4 inline-block text-brand-700 hover:underline dark:text-brand-400"
                href={`/berita${buildContentSlug(p.numericId, p.title)}`}
              >
                Baca selengkapnya →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
