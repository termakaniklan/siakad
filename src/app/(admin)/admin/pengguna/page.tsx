import { redirect } from 'next/navigation';

import { UsersManager } from '@/components/admin/users-manager';
import { getPrincipal } from '@/modules/auth/principal';
import { PERMISSIONS } from '@/modules/rbac/permissions';
import { hasAnyPermission } from '@/modules/rbac/policy';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

export default async function PenggunaPage() {
  const principal = await getPrincipal();
  if (!hasAnyPermission(principal, PERMISSIONS.USER_VIEW)) redirect('/admin');

  const canManage = hasAnyPermission(principal, PERMISSIONS.USER_MANAGE);

  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      include: { roles: { select: { id: true, code: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.role.findMany({
      where: { deletedAt: null },
      orderBy: { code: 'asc' },
      select: { id: true, code: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Pengguna</h1>
        <p className="text-sm text-slate-500">
          Kelola akun pengguna sekolah. Penghapusan bersifat soft-delete dan otomatis mengakhiri
          seluruh sesi pengguna.
        </p>
      </div>
      <UsersManager
        canManage={canManage}
        currentUserId={principal!.userId}
        roles={roles}
        initial={users.map((u) => ({
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          username: u.username,
          phone: u.phone,
          isActive: u.isActive,
          roleCodes: u.roles.map((r) => r.code),
          roleNames: u.roles.map((r) => r.name),
        }))}
      />
    </div>
  );
}
