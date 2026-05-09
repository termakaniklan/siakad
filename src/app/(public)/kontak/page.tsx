import Link from 'next/link';

import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

export default async function KontakPage() {
  const school = await prisma.schoolProfile.findFirst().catch(() => null);
  return (
    <main className="container py-12">
      <p className="text-sm text-slate-500">
        <Link href="/" className="hover:underline">
          Beranda
        </Link>{' '}
        / Kontak
      </p>
      <h1 className="mt-2 text-3xl font-bold">Hubungi Kami</h1>
      <div className="mt-8 max-w-md space-y-2 text-slate-700 dark:text-slate-300">
        {school?.address && (
          <p>
            <span className="font-semibold">Alamat:</span> {school.address}
          </p>
        )}
        {school?.phone && (
          <p>
            <span className="font-semibold">Telepon:</span> {school.phone}
          </p>
        )}
        {school?.email && (
          <p>
            <span className="font-semibold">Email:</span>{' '}
            <a
              className="text-brand-700 hover:underline dark:text-brand-400"
              href={`mailto:${school.email}`}
            >
              {school.email}
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
