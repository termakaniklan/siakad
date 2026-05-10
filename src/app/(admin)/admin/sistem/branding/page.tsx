import { redirect } from 'next/navigation';

import { BrandingForm } from '@/components/admin/branding-form';
import { getPrincipal } from '@/modules/auth/principal';
import { getBranding } from '@/modules/branding/service';
import { ROLES } from '@/modules/rbac/permissions';

export const dynamic = 'force-dynamic';

export default async function BrandingAdminPage() {
  const principal = await getPrincipal();
  if (
    !principal ||
    !principal.roleCodes.some((c) => [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(c as never))
  ) {
    redirect('/admin');
  }
  const branding = await getBranding();
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">Branding</h1>
        <p className="text-sm text-slate-500">
          Atur favicon, background halaman login, logo sekolah, judul situs, dan warna utama.
          Perubahan tersimpan langsung dan ter-audit (lihat Audit Log).
        </p>
      </div>
      <BrandingForm initial={branding} />
    </div>
  );
}
