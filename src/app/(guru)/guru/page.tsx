import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPrincipal } from '@/modules/auth/principal';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

export default async function GuruDashboard() {
  const principal = await getPrincipal();
  if (!principal) return null;

  const [teacher, homeroomClasses, scheduleCount, examCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: principal.userId },
      select: { id: true, fullName: true, nip: true },
    }),
    prisma.class
      .findMany({
        where: { homeroomTeacherId: principal.userId, deletedAt: null },
        select: {
          id: true,
          name: true,
          level: true,
          enrollments: { where: { deletedAt: null }, select: { id: true } },
        },
      })
      .catch(() => []),
    prisma.classSchedule.count({ where: { teacherId: principal.userId } }).catch(() => 0),
    prisma.exam.count({ where: { deletedAt: null }, take: 1 }).catch(() => 0),
  ]);

  const totalStudents = homeroomClasses.reduce((acc, c) => acc + c.enrollments.length, 0);

  const QUICK_LINKS = [
    {
      title: 'Kelas Saya',
      desc: `${homeroomClasses.length} kelas wali · ${totalStudents} siswa`,
      href: '/guru/kelas',
    },
    { title: 'Jadwal Mengajar', desc: `${scheduleCount} jadwal aktif`, href: '/guru/jadwal' },
    { title: 'Input Nilai', desc: 'Nilai harian, UTS, UAS', href: '/guru/nilai' },
    { title: 'Absensi Kelas', desc: 'Tandai kehadiran harian', href: '/guru/absensi' },
    { title: 'Bank Soal', desc: 'Kelola soal CBT', href: '/guru/bank-soal' },
    { title: 'Materi', desc: 'Unggah materi pembelajaran', href: '/guru/materi' },
  ];

  return (
    <div className="grid gap-6">
      <Card className="border-sky-200 bg-sky-50/40 dark:border-sky-900 dark:bg-sky-950/30">
        <CardHeader>
          <CardDescription className="text-xs uppercase tracking-wider">
            Selamat datang
          </CardDescription>
          <CardTitle className="text-2xl">{teacher?.fullName ?? 'Guru'}</CardTitle>
          <CardDescription>
            NIP {teacher?.nip ?? '—'} · {homeroomClasses.length} kelas wali · {scheduleCount} jadwal
            mengajar · {examCount} ujian aktif tersedia
          </CardDescription>
        </CardHeader>
      </Card>

      {homeroomClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kelas Wali</CardTitle>
            <CardDescription>Kelas yang Anda pegang sebagai wali kelas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {homeroomClasses.map((c) => (
                <Link
                  key={c.id}
                  href={`/guru/kelas/${c.id}`}
                  className="rounded-lg border border-slate-200 bg-white p-4 hover:border-sky-400 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="text-xs uppercase tracking-wider text-slate-500">
                    Kelas {c.level}
                  </div>
                  <div className="mt-1 text-lg font-semibold">{c.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{c.enrollments.length} siswa</div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>Pintasan modul yang sering digunakan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {QUICK_LINKS.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-sky-400 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="text-base font-semibold">{q.title}</div>
                <div className="mt-1 text-sm text-slate-500">{q.desc}</div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
