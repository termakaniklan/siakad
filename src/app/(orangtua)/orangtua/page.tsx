import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPrincipal } from '@/modules/auth/principal';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  present: {
    label: 'Hadir',
    cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  },
  late: {
    label: 'Terlambat',
    cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  },
  sick: {
    label: 'Sakit',
    cls: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  },
  permission: {
    label: 'Izin',
    cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  },
  absent: {
    label: 'Alpa',
    cls: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  },
};

const RELATIONSHIP_LABEL: Record<string, string> = {
  ayah: 'Ayah',
  ibu: 'Ibu',
  wali: 'Wali',
};

interface ChildRow {
  id: string;
  fullName: string;
  nis: string | null;
  className: string | null;
  relationship: string;
  attendanceCounters: Record<string, number>;
  hadirPct: number;
  recent: Array<{ id: string; date: Date; status: string; notes: string | null }>;
}

export default async function OrangTuaDashboard() {
  const principal = await getPrincipal();
  if (!principal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tidak terautentikasi</CardTitle>
          <CardDescription>
            <Link className="underline" href="/login">
              Silakan masuk
            </Link>
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const [parent, links, announcements] = await Promise.all([
    prisma.user.findUnique({ where: { id: principal.userId } }).catch(() => null),
    prisma.parentLink
      .findMany({
        where: { parentUserId: principal.userId },
        include: {
          child: {
            include: {
              studentEnrollments: {
                where: { deletedAt: null },
                include: { class: true },
                take: 1,
                orderBy: { createdAt: 'desc' },
              },
            },
          },
        },
      })
      .catch(() => []),
    prisma.announcement
      .findMany({
        where: {
          deletedAt: null,
          OR: [{ audience: 'all' }, { audience: 'role:orang_tua' }],
        },
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        take: 6,
      })
      .catch(() => []),
  ]);

  // For each child gather attendance + upcoming exams.
  const childRows: ChildRow[] = [];
  const childClassIds = new Set<string>();
  for (const link of links) {
    const child = link.child;
    const enroll = child.studentEnrollments[0] ?? null;
    if (enroll) childClassIds.add(enroll.classId);

    const marks = await prisma.attendanceMark
      .findMany({
        where: { studentId: child.id },
        orderBy: { date: 'desc' },
        take: 14,
      })
      .catch(() => []);

    const counters = marks.reduce(
      (acc, m) => {
        acc[m.status] = (acc[m.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const total = marks.length || 1;
    const hadirPct = Math.round((((counters.present ?? 0) + (counters.late ?? 0)) / total) * 100);

    childRows.push({
      id: child.id,
      fullName: child.fullName,
      nis: child.nis,
      className: enroll?.class?.name ?? null,
      relationship: link.relationship,
      attendanceCounters: counters,
      hadirPct,
      recent: marks.slice(0, 7).map((m) => ({
        id: m.id,
        date: m.date,
        status: m.status,
        notes: m.notes,
      })),
    });
  }

  const upcomingExams = childClassIds.size
    ? await prisma.exam
        .findMany({
          where: {
            deletedAt: null,
            isPublished: true,
            classMappings: { some: { classId: { in: [...childClassIds] } } },
            endAt: { gte: new Date() },
          },
          include: { subject: true },
          orderBy: { startAt: 'asc' },
          take: 5,
        })
        .catch(() => [])
    : [];

  return (
    <div className="grid gap-6">
      <Card className="dark:bg-brand-950/30 border-brand-200 bg-brand-50/40 dark:border-brand-900">
        <CardHeader>
          <CardDescription className="text-xs uppercase tracking-wider">
            Selamat datang
          </CardDescription>
          <CardTitle className="text-2xl">{parent?.fullName ?? 'Orang Tua / Wali'}</CardTitle>
          <CardDescription>
            Anda terhubung ke {childRows.length} anak. Pantau kehadiran, ujian, dan pengumuman di
            satu tempat.
          </CardDescription>
        </CardHeader>
      </Card>

      {childRows.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada anak terhubung</CardTitle>
            <CardDescription>
              Hubungi admin sekolah untuk menautkan akun Anda dengan data siswa.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {childRows.map((c) => (
        <Card key={c.id}>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>{c.fullName}</CardTitle>
                <CardDescription>
                  {c.className ? `${c.className} · ` : ''}NIS {c.nis ?? '—'} · sebagai{' '}
                  <span className="font-medium">
                    {RELATIONSHIP_LABEL[c.relationship] ?? c.relationship}
                  </span>
                </CardDescription>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                Kehadiran 14 hari: {c.hadirPct}%
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {(['present', 'late', 'permission', 'sick', 'absent'] as const).map((s) => (
                <div
                  key={s}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="text-xs uppercase tracking-wider text-slate-500">
                    {STATUS_LABEL[s]!.label}
                  </div>
                  <div className="text-2xl font-semibold">{c.attendanceCounters[s] ?? 0}</div>
                </div>
              ))}
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                role="progressbar"
                aria-label={`Persentase kehadiran ${c.fullName}`}
                aria-valuenow={c.hadirPct}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-full bg-emerald-500"
                style={{ width: `${c.hadirPct}%` }}
              />
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold">7 catatan kehadiran terakhir</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800">
                    <tr>
                      <th className="px-3 py-2">Tanggal</th>
                      <th className="px-3 py-2">Hari</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {c.recent.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-4 text-center text-slate-500">
                          Belum ada data.
                        </td>
                      </tr>
                    )}
                    {c.recent.map((m) => {
                      const meta = STATUS_LABEL[m.status] ?? STATUS_LABEL.absent!;
                      const date = new Date(m.date);
                      return (
                        <tr key={m.id}>
                          <td className="px-3 py-2 font-mono text-xs">
                            {date.toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                            {date.toLocaleDateString('id-ID', { weekday: 'long' })}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${meta.cls}`}
                            >
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                            {m.notes ?? '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Ujian Mendatang</CardTitle>
          <CardDescription>Daftar ujian aktif / terjadwal untuk kelas anak Anda.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-2">Mata Pelajaran</th>
                <th className="px-4 py-2">Judul</th>
                <th className="px-4 py-2">Mulai</th>
                <th className="px-4 py-2">Selesai</th>
                <th className="px-4 py-2">Durasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {upcomingExams.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    Tidak ada ujian terjadwal saat ini.
                  </td>
                </tr>
              )}
              {upcomingExams.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-2 font-medium">{e.subject.code}</td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-200">{e.title}</td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {new Date(e.startAt).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {new Date(e.endAt).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="px-4 py-2">{e.durationMinutes} menit</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pengumuman Terbaru</CardTitle>
          <CardDescription>Informasi penting untuk orang tua / wali.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {announcements.length === 0 && (
              <li className="text-sm text-slate-500">Tidak ada pengumuman saat ini.</li>
            )}
            {announcements.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
              >
                <div className="flex items-center gap-2">
                  {a.isPinned && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                      Disematkan
                    </span>
                  )}
                  <h3 className="font-semibold">{a.title}</h3>
                </div>
                <p className="mt-1 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                  {a.body}
                </p>
                {a.publishedAt && (
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(a.publishedAt).toLocaleDateString('id-ID', {
                      dateStyle: 'medium',
                    })}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
