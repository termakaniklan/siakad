import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default async function AdminKehadiranPage() {
  // Today (date only, UTC-friendly comparison; demo data uses 07:00 markers).
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const [todayMarks, classes, weekStats] = await Promise.all([
    prisma.attendanceMark
      .findMany({
        where: { date: { gte: start, lte: end } },
        include: {
          student: { select: { id: true, fullName: true, nis: true, studentEnrollments: true } },
        },
        take: 200,
      })
      .catch(() => []),
    prisma.class
      .findMany({
        where: { deletedAt: null },
        include: {
          enrollments: { include: { student: { select: { id: true, fullName: true, nis: true } } } },
          homeroomTeacher: { select: { fullName: true } },
        },
        orderBy: { name: 'asc' },
      })
      .catch(() => []),
    weeklyStats(),
  ]);

  const counters = todayMarks.reduce(
    (acc, m) => {
      acc[m.status] = (acc[m.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Rekap Kehadiran Harian</CardTitle>
          <CardDescription>
            Pantau kehadiran semua siswa per kelas. Data hari ini diperbarui realtime.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {(['present', 'late', 'permission', 'sick', 'absent'] as const).map((s) => (
          <Card key={s}>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-wider">
                {STATUS_LABEL[s]!.label}
              </CardDescription>
              <CardTitle className="text-3xl">{counters[s] ?? 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${STATUS_LABEL[s]!.cls}`}>
                Hari ini
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tren 7 Hari Terakhir</CardTitle>
          <CardDescription>
            Persentase kehadiran (hadir + terlambat) per hari.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekStats.map((d) => (
              <div key={d.date} className="text-center">
                <div className="relative mx-auto h-32 w-8 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                  <div
                    className="absolute bottom-0 w-full bg-emerald-500"
                    style={{ height: `${d.pct}%` }}
                    aria-label={`${d.pct}% kehadiran ${d.dayLabel}`}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">{d.dayLabel}</p>
                <p className="text-xs font-mono">{d.pct}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kehadiran per Kelas</CardTitle>
          <CardDescription>Total siswa, status hari ini, wali kelas.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-4 py-2">Kelas</th>
                <th className="px-4 py-2">Wali Kelas</th>
                <th className="px-4 py-2">Siswa</th>
                <th className="px-4 py-2">Hadir</th>
                <th className="px-4 py-2">Telat</th>
                <th className="px-4 py-2">Izin</th>
                <th className="px-4 py-2">Sakit</th>
                <th className="px-4 py-2">Alpa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {classes.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                    Belum ada data kelas.
                  </td>
                </tr>
              )}
              {classes.map((cls) => {
                const studentIds = cls.enrollments.map((e) => e.student.id);
                const classMarks = todayMarks.filter((m) => studentIds.includes(m.studentId));
                const c = classMarks.reduce(
                  (acc, m) => {
                    acc[m.status] = (acc[m.status] ?? 0) + 1;
                    return acc;
                  },
                  {} as Record<string, number>,
                );
                return (
                  <tr key={cls.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="px-4 py-2 font-medium">{cls.name}</td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                      {cls.homeroomTeacher?.fullName ?? '—'}
                    </td>
                    <td className="px-4 py-2 font-mono">{cls.enrollments.length}</td>
                    <td className="px-4 py-2 text-emerald-700 dark:text-emerald-300">
                      {c.present ?? 0}
                    </td>
                    <td className="px-4 py-2 text-amber-700 dark:text-amber-300">
                      {c.late ?? 0}
                    </td>
                    <td className="px-4 py-2 text-blue-700 dark:text-blue-300">
                      {c.permission ?? 0}
                    </td>
                    <td className="px-4 py-2 text-rose-700 dark:text-rose-300">{c.sick ?? 0}</td>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                      {c.absent ?? 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

async function weeklyStats(): Promise<Array<{ date: string; dayLabel: string; pct: number }>> {
  const days: Array<{ date: string; dayLabel: string; pct: number }> = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const e = new Date(d);
    e.setHours(23, 59, 59, 999);
    const marks = await prisma.attendanceMark
      .findMany({ where: { date: { gte: d, lte: e } }, take: 5000 })
      .catch(() => []);
    const total = marks.length || 1;
    const ok = marks.filter((m) => m.status === 'present' || m.status === 'late').length;
    days.push({
      date: d.toISOString().slice(0, 10),
      dayLabel: d.toLocaleDateString('id-ID', { weekday: 'short' }),
      pct: marks.length === 0 ? 0 : Math.round((ok / total) * 100),
    });
  }
  return days;
}
