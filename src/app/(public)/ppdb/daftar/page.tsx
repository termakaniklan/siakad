import Link from 'next/link';

import { PpdbWizard } from '@/modules/ppdb/components/wizard';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

export default async function PpdbDaftarPage() {
  const provinces = await prisma.province.findMany({ orderBy: { name: 'asc' } }).catch(() => []);
  return (
    <main className="container py-12">
      <p className="text-sm text-slate-500">
        <Link href="/" className="hover:underline">
          Beranda
        </Link>{' '}
        /{' '}
        <Link href="/ppdb" className="hover:underline">
          PPDB
        </Link>{' '}
        / Daftar
      </p>
      <h1 className="mt-2 text-3xl font-bold">Form Pendaftaran PPDB</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Form ini akan menyimpan draft otomatis setiap kali Anda mengisi kolom.
      </p>
      <div className="mt-8 max-w-3xl">
        <PpdbWizard provinces={provinces.map((p) => ({ id: p.id, name: p.name }))} />
      </div>
    </main>
  );
}
