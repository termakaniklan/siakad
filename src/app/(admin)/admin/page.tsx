import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPrincipal } from '@/modules/auth/principal';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const principal = await getPrincipal();
  const [users, classes, ppdb, exams] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }).catch(() => 0),
    prisma.class.count({ where: { deletedAt: null } }).catch(() => 0),
    prisma.ppdbApplication
      .count({ where: { deletedAt: null, status: 'submitted' } })
      .catch(() => 0),
    prisma.exam.count({ where: { deletedAt: null } }).catch(() => 0),
  ]);

  const stats = [
    { label: 'Pengguna aktif', value: users },
    { label: 'Kelas aktif', value: classes },
    { label: 'PPDB tertunda', value: ppdb },
    { label: 'Ujian tersedia', value: exams },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-slate-500">Ringkasan singkat sistem.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-3xl">{s.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Selamat datang{principal ? `, ${principal.userId}` : ''}</CardTitle>
          <CardDescription>
            Mulai dengan mengelola data akademik atau publikasi CMS.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 dark:text-slate-400">
          Modul user/role/permission sudah aktif. Modul lain telah disiapkan kerangkanya — silakan
          isi sesuai kebutuhan operasional sekolah.
        </CardContent>
      </Card>
    </div>
  );
}
