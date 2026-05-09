import { redirect } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPrincipal } from '@/modules/auth/principal';
import { hasAnyPermission } from '@/modules/rbac/policy';
import { PERMISSIONS } from '@/modules/rbac/permissions';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

export default async function PenggunaPage() {
  const principal = await getPrincipal();
  if (!hasAnyPermission(principal, PERMISSIONS.USER_VIEW)) redirect('/admin');

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    include: { roles: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pengguna</h1>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-2">Nama</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Username</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2 font-medium">{u.fullName}</td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{u.email}</td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{u.username}</td>
                  <td className="px-4 py-2">{u.roles.map((r) => r.name).join(', ')}</td>
                  <td className="px-4 py-2">
                    <span className={u.isActive ? 'text-emerald-600' : 'text-red-600'}>
                      {u.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                    Belum ada pengguna.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
