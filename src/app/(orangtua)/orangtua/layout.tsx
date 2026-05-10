import { redirect } from 'next/navigation';

import { PortalShell } from '@/components/portal/shell';
import { getPrincipal } from '@/modules/auth/principal';
import { filterNav, ORANGTUA_NAV } from '@/modules/rbac/nav';
import { ROLES } from '@/modules/rbac/permissions';
import { prisma } from '@/shared/db/prisma';

export default async function OrangTuaLayout({ children }: { children: React.ReactNode }) {
  const principal = await getPrincipal();
  if (!principal) redirect('/login');
  // Allow direct parent access plus internal staff for support/preview.
  if (
    !principal.roleCodes.some((c) =>
      [ROLES.ORANG_TUA, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(c as never),
    )
  ) {
    redirect('/');
  }
  const user = await prisma.user.findUnique({
    where: { id: principal.userId },
    select: { fullName: true, avatarUrl: true },
  });
  const catalogue = filterNav(ORANGTUA_NAV, principal);
  return (
    <PortalShell
      catalogue={catalogue}
      user={{
        fullName: user?.fullName ?? 'Orang Tua / Wali',
        avatarUrl: user?.avatarUrl ?? null,
        roleCodes: principal.roleCodes,
      }}
    >
      {children}
    </PortalShell>
  );
}
