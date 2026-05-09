import { redirect } from 'next/navigation';

import { getPrincipal } from '@/modules/auth/principal';
import { ROLES } from '@/modules/rbac/permissions';

export default async function SiswaLayout({ children }: { children: React.ReactNode }) {
  const principal = await getPrincipal();
  if (!principal) redirect('/login');
  if (
    !principal.roleCodes.some((c) =>
      [
        ROLES.SISWA,
        ROLES.ORANG_TUA,
        ROLES.GURU,
        ROLES.WALI_KELAS,
        ROLES.ADMIN,
        ROLES.SUPER_ADMIN,
      ].includes(c as never),
    )
  ) {
    redirect('/');
  }
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">Portal Siswa</h1>
      <p className="mt-1 text-sm text-slate-500">Akses jadwal, nilai, ujian, kehadiran.</p>
      <section className="mt-6">{children}</section>
    </div>
  );
}
