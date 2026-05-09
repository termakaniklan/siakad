import Link from 'next/link';

import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

export default async function ProfilPage() {
  const school = await prisma.schoolProfile.findFirst().catch(() => null);
  return (
    <main className="container py-12">
      <p className="text-sm text-slate-500">
        <Link href="/" className="hover:underline">
          Beranda
        </Link>{' '}
        / Profil
      </p>
      <h1 className="mt-2 text-3xl font-bold">{school?.name ?? 'Profil Sekolah'}</h1>
      {school?.address && (
        <p className="mt-1 text-slate-600 dark:text-slate-400">{school.address}</p>
      )}
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold">Visi</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-300">
            {school?.visionText ??
              'Visi sekolah belum diatur. Admin dapat mengaturnya dari dashboard.'}
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Misi</h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-300">
            {school?.missionText ?? 'Misi sekolah belum diatur.'}
          </p>
        </section>
      </div>
    </main>
  );
}
