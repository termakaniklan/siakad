import Link from 'next/link';

import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

export default async function GaleriPage() {
  const categories = await prisma.galleryCategory
    .findMany({
      where: { deletedAt: null },
      include: {
        items: {
          where: { isPublished: true, deletedAt: null },
          orderBy: { order: 'asc' },
          take: 8,
        },
      },
      orderBy: { order: 'asc' },
    })
    .catch(() => []);

  return (
    <main className="container py-12">
      <p className="text-sm text-slate-500">
        <Link href="/" className="hover:underline">
          Beranda
        </Link>{' '}
        / Galeri
      </p>
      <h1 className="mt-2 text-3xl font-bold">Galeri</h1>
      {categories.length === 0 && <p className="mt-4 text-slate-500">Galeri masih kosong.</p>}
      {categories.map((c) => (
        <section key={c.id} className="mt-10">
          <h2 className="text-xl font-semibold">{c.name}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {c.items.map((it) => (
              <figure
                key={it.id}
                className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.thumbnailUrl ?? it.imageUrl ?? '/icons/icon-512.png'}
                  alt={it.title}
                  className="h-40 w-full object-cover"
                />
                <figcaption className="p-2 text-sm">{it.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
