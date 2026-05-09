import { redirect } from 'next/navigation';

import { getPrincipal } from '@/modules/auth/principal';

import { AdminShell } from '@/components/admin/shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const principal = await getPrincipal();
  if (!principal) redirect('/login');
  return <AdminShell principal={principal}>{children}</AdminShell>;
}
