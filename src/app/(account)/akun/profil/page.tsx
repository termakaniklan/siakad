import { redirect } from 'next/navigation';

import { ProfilForm } from '@/components/profil/form';
import { getPrincipal } from '@/modules/auth/principal';
import { landingPathForRoles } from '@/modules/rbac/nav';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

export default async function ProfilPage() {
  const principal = await getPrincipal();
  if (!principal) redirect('/login');
  const user = await prisma.user.findUnique({
    where: { id: principal.userId },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      phone: true,
      avatarUrl: true,
      nis: true,
      nip: true,
      roles: { select: { code: true, name: true } },
    },
  });
  if (!user) redirect('/login');
  const back = landingPathForRoles(principal.roleCodes);
  return (
    <div className="container max-w-3xl py-10">
      <a className="text-sm text-slate-500 hover:underline" href={back}>
        ← Kembali ke {back}
      </a>
      <h1 className="mt-2 text-2xl font-bold">Profil Saya</h1>
      <p className="mt-1 text-sm text-slate-500">
        Setiap pengguna dapat memperbarui foto, nama, telepon, dan password sendiri. Email &
        username dikelola admin untuk mencegah pengambilalihan akun.
      </p>
      <ProfilForm
        user={{
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          nis: user.nis,
          nip: user.nip,
          roleNames: user.roles.map((r) => r.name),
        }}
      />
    </div>
  );
}
