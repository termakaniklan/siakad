import { redirect } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPrincipal } from '@/modules/auth/principal';
import { PERMISSIONS } from '@/modules/rbac/permissions';
import { hasAnyPermission } from '@/modules/rbac/policy';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

export default async function PermissionPage() {
  const principal = await getPrincipal();
  if (!hasAnyPermission(principal, PERMISSIONS.PERMISSION_MANAGE, PERMISSIONS.ROLE_MANAGE)) {
    redirect('/admin');
  }
  const permissions = await prisma.permission.findMany({
    where: { deletedAt: null },
    orderBy: { code: 'asc' },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Permission</h1>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Permission ({permissions.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-2">Kode</th>
                <th className="px-4 py-2">Nama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {permissions.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 font-mono text-xs">{p.code}</td>
                  <td className="px-4 py-2">{p.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
