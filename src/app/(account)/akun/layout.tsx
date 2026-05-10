import { redirect } from 'next/navigation';

import { getPrincipal } from '@/modules/auth/principal';

export default async function ProfilLayout({ children }: { children: React.ReactNode }) {
  const principal = await getPrincipal();
  if (!principal) redirect('/login');
  return <>{children}</>;
}
