import { redirect } from 'next/navigation';

import { getPrincipal } from '@/modules/auth/principal';
import { ROLES } from '@/modules/rbac/permissions';

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
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">Portal Orang Tua / Wali</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pantau perkembangan akademik dan kehadiran anak Anda.
      </p>
      <section className="mt-6">{children}</section>
    </div>
  );
}
