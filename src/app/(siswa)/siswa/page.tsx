import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SECTIONS = [
  { title: 'Jadwal', desc: 'Lihat jadwal pelajaran mingguan.', href: '/siswa/jadwal' },
  { title: 'Nilai', desc: 'Pantau perkembangan nilai per mata pelajaran.', href: '/siswa/nilai' },
  { title: 'Ujian', desc: 'Daftar ujian aktif dan terjadwal.', href: '/siswa/ujian' },
  { title: 'Kehadiran', desc: 'Riwayat kehadiran dan keterangan.', href: '/siswa/kehadiran' },
  { title: 'Materi', desc: 'Materi yang diunggah guru.', href: '/siswa/materi' },
  { title: 'Pengumuman', desc: 'Pengumuman terbaru.', href: '/siswa/pengumuman' },
];

export default function SiswaIndexPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {SECTIONS.map((s) => (
        <Link key={s.href} href={s.href}>
          <Card className="h-full transition hover:border-brand-500">
            <CardHeader>
              <CardTitle>{s.title}</CardTitle>
              <CardDescription>{s.desc}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-500 dark:text-slate-400">
              Buka modul →
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
