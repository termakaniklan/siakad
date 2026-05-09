import { notFound } from 'next/navigation';

import { sanitizeHtml } from '@/shared/security/sanitize';
import { parseContentSlug } from '@/lib/utils';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

export default async function BeritaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = parseContentSlug(`/${slug}`);
  if (!id) notFound();
  const post = await prisma.newsPost
    .findFirst({
      where: { numericId: Number(id), isPublished: true, deletedAt: null },
    })
    .catch(() => null);
  if (!post) notFound();

  return (
    <main className="container py-12">
      <article className="prose prose-slate dark:prose-invert mx-auto">
        <h1>{post.title}</h1>
        <p className="text-sm text-slate-500">
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('id-ID') : '—'}
        </p>
        {post.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- editorial image, dynamic dimensions
          <img alt={post.title} src={post.coverImageUrl} />
        )}
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content, 'richText') }} />
      </article>
    </main>
  );
}
