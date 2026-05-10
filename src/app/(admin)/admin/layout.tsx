import { redirect } from 'next/navigation';

import { AdminShell } from '@/components/admin/shell';
import { getPrincipal } from '@/modules/auth/principal';
import { ROLES } from '@/modules/rbac/permissions';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const principal = await getPrincipal();
  if (!principal) redirect('/login');
  if (
    !principal.roleCodes.some((c) =>
      [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.OPERATOR].includes(c as never),
    )
  ) {
    // Non-admin roles are kicked back to their own portal landing.
    if (principal.roleCodes.includes(ROLES.GURU) || principal.roleCodes.includes(ROLES.WALI_KELAS))
      redirect('/guru');
    if (principal.roleCodes.includes(ROLES.SISWA)) redirect('/siswa');
    if (principal.roleCodes.includes(ROLES.ORANG_TUA)) redirect('/orangtua');
    redirect('/');
  }
  return <AdminShell principal={principal}>{children}</AdminShell>;
}
