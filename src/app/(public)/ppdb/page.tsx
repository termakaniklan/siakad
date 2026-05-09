import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

export default async function PpdbLandingPage() {
  const setting = await prisma.setting
    .findUnique({ where: { key: 'ppdb.is_open' } })
    .catch(() => null);
  const isOpen = Boolean(setting?.value);
  const activeYear = await prisma.academicYear
    .findFirst({ where: { isActive: true } })
    .catch(() => null);

  return (
    <main className="container py-12">
      <p className="text-sm text-slate-500">
        <Link href="/" className="hover:underline">
          Beranda
        </Link>{' '}
        / PPDB
      </p>
      <h1 className="mt-2 text-3xl font-bold">Penerimaan Peserta Didik Baru</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Tahun ajaran {activeYear?.code ?? '—'}
      </p>

      <Card className="mt-8 max-w-3xl">
        <CardHeader>
          <CardTitle>
            Status: {isOpen ? 'Pendaftaran Dibuka' : 'Pendaftaran Belum Dibuka'}
          </CardTitle>
          <CardDescription>
            Form pendaftaran terdiri dari beberapa langkah. Draft otomatis tersimpan setiap
            perubahan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <p>
            Siapkan dokumen identitas (kartu keluarga, akta kelahiran), foto, dan informasi orang
            tua/wali.
          </p>
          <p>
            Validasi alamat menggunakan basis data wilayah Indonesia (provinsi → kabupaten/kota →
            kecamatan → desa/kelurahan).
          </p>
          <div className="pt-2">
            {isOpen ? (
              <Link href="/ppdb/daftar">
                <Button size="lg">Mulai Pendaftaran</Button>
              </Link>
            ) : (
              <Button size="lg" disabled>
                Belum dibuka
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
