import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPrincipal } from '@/modules/auth/principal';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, { label: string; cls: string; emoji: string }> = {
  present: {
    label: 'Hadir',
    cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
    emoji: '✓',
  },
  late: {
    label: 'Terlambat',
    cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    emoji: '⏱',
  },
  sick: {
    label: 'Sakit',
    cls: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
    emoji: 'S',
  },
  permission: {
    label: 'Izin',
    cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    emoji: 'I',
  },
  absent: {
    label: 'Alpa',
    cls: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    emoji: 'A',
  },
};

export default async function SiswaKehadiranPage() {
  const principal = await getPrincipal();
  if (!principal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tidak terautentikasi</CardTitle>
          <CardDescription>
            <Link className="underline" href="/login">
              Masuk dulu
            </Link>
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const studentIdResolved = await resolveStudentId(principal.userId);
  const marks = await prisma.attendanceMark
    .findMany({
      where: { studentId: studentIdResolved },
      orderBy: { date: 'desc' },
      take: 30,
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

  return (
    <div className="grid gap-6">
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
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs ${STATUS_LABEL[s]!.cls}`}
              >
                {STATUS_LABEL[s]!.emoji}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tingkat Kehadiran 30 Hari Terakhir</CardTitle>
          <CardDescription>
            {hadirPct}% (hadir + terlambat) dari {total} pertemuan tercatat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              role="progressbar"
              aria-label="Persentase kehadiran"
              aria-valuenow={hadirPct}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-full bg-emerald-500"
              style={{ width: `${hadirPct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Kehadiran</CardTitle>
          <CardDescription>30 catatan terakhir, terbaru di atas.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">Hari</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {marks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    Belum ada data kehadiran.
                  </td>
                </tr>
              )}
              {marks.map((m) => {
                const meta = STATUS_LABEL[m.status] ?? STATUS_LABEL.absent!;
                const date = new Date(m.date);
                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="px-4 py-2 font-mono text-xs">
                      {date.toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                      {date.toLocaleDateString('id-ID', { weekday: 'long' })}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${meta.cls}`}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                      {m.notes ?? '—'}
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

async function resolveStudentId(userId: string): Promise<string> {
  // For demo: principal.userId IS the student user id; in multi-tenant we'd
  // resolve via parent → child link or impersonation.
  return userId;
}
