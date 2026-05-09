import { redirect } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPrincipal } from '@/modules/auth/principal';
import { PERMISSIONS } from '@/modules/rbac/permissions';
import { hasAnyPermission } from '@/modules/rbac/policy';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

export default async function RolePage() {
  const principal = await getPrincipal();
  if (!hasAnyPermission(principal, PERMISSIONS.ROLE_VIEW, PERMISSIONS.ROLE_MANAGE))
    redirect('/admin');
  const roles = await prisma.role.findMany({
    where: { deletedAt: null },
    include: { permissions: true, _count: { select: { users: true } } },
    orderBy: { name: 'asc' },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Role</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle>{r.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-400">
              <p>
                Code: <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">{r.code}</code>
              </p>
              <p>{r._count.users} pengguna</p>
              <p className="mt-2">{r.permissions.length} permission terikat.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
