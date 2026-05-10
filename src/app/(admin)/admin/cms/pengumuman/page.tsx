import { redirect } from 'next/navigation';

import { AnnouncementsManager } from '@/components/admin/announcements-manager';
import { getPrincipal } from '@/modules/auth/principal';
import { PERMISSIONS } from '@/modules/rbac/permissions';
import { hasAnyPermission } from '@/modules/rbac/policy';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminPengumumanPage() {
  const principal = await getPrincipal();
  if (!hasAnyPermission(principal, PERMISSIONS.CMS_ANNOUNCEMENT_MANAGE)) redirect('/admin');
  const items = await prisma.announcement.findMany({
    where: { deletedAt: null },
    orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: 50,
  });
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">Pengumuman</h1>
        <p className="text-sm text-slate-500">
          Pengumuman dapat ditargetkan ke audiens tertentu (seluruh sekolah, role tertentu, atau
          kelas tertentu).
        </p>
      </div>
      <AnnouncementsManager
        initial={items.map((a) => ({
          id: a.id,
          title: a.title,
          body: a.body,
          audience: a.audience,
          publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
          expiresAt: a.expiresAt ? a.expiresAt.toISOString() : null,
          isPinned: a.isPinned,
        }))}
      />
    </div>
  );
}
