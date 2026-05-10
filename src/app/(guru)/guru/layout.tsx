import { redirect } from 'next/navigation';

import { PortalShell } from '@/components/portal/shell';
import { getPrincipal } from '@/modules/auth/principal';
import { filterNav, GURU_NAV } from '@/modules/rbac/nav';
import { ROLES } from '@/modules/rbac/permissions';
import { prisma } from '@/shared/db/prisma';

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  const principal = await getPrincipal();
  if (!principal) redirect('/login');
  if (
    !principal.roleCodes.some((c) =>
      [ROLES.GURU, ROLES.WALI_KELAS, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(c as never),
    )
  ) {
    redirect('/');
  }
  const user = await prisma.user.findUnique({
    where: { id: principal.userId },
    select: { fullName: true, avatarUrl: true },
  });
  const catalogue = filterNav(GURU_NAV, principal);
  return (
    <PortalShell
      catalogue={catalogue}
      user={{
        fullName: user?.fullName ?? 'Guru',
        avatarUrl: user?.avatarUrl ?? null,
        roleCodes: principal.roleCodes,
      }}
    >
      {children}
    </PortalShell>
  );
}
