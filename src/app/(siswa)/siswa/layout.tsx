import { redirect } from 'next/navigation';

import { PortalShell } from '@/components/portal/shell';
import { getPrincipal } from '@/modules/auth/principal';
import { filterNav, SISWA_NAV } from '@/modules/rbac/nav';
import { ROLES } from '@/modules/rbac/permissions';
import { prisma } from '@/shared/db/prisma';

export default async function SiswaLayout({ children }: { children: React.ReactNode }) {
  const principal = await getPrincipal();
  if (!principal) redirect('/login');
  if (
    !principal.roleCodes.some((c) =>
      [ROLES.SISWA, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(c as never),
    )
  ) {
    redirect('/');
  }
  const user = await prisma.user.findUnique({
    where: { id: principal.userId },
    select: { fullName: true, avatarUrl: true },
  });
  const catalogue = filterNav(SISWA_NAV, principal);
  return (
    <PortalShell
      catalogue={catalogue}
      user={{
        fullName: user?.fullName ?? 'Siswa',
        avatarUrl: user?.avatarUrl ?? null,
        roleCodes: principal.roleCodes,
      }}
    >
      {children}
    </PortalShell>
  );
}
