import { redirect } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPrincipal } from '@/modules/auth/principal';
import { PERMISSIONS } from '@/modules/rbac/permissions';
import { hasAnyPermission } from '@/modules/rbac/policy';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
  const principal = await getPrincipal();
  if (!hasAnyPermission(principal, PERMISSIONS.AUDIT_LOG_VIEW)) redirect('/admin');
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { actor: { select: { username: true, email: true } } },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audit Log</h1>
      <Card>
        <CardHeader>
          <CardTitle>100 Aktivitas Terakhir</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-2">Waktu</th>
                <th className="px-4 py-2">Aktor</th>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">Entitas</th>
                <th className="px-4 py-2">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-2 text-slate-500">{l.createdAt.toISOString()}</td>
                  <td className="px-4 py-2">{l.actor?.username ?? l.actorUserId ?? '—'}</td>
                  <td className="px-4 py-2 font-mono text-xs">{l.action}</td>
                  <td className="px-4 py-2">
                    {[l.entityType, l.entityId].filter(Boolean).join(':')}
                  </td>
                  <td className="px-4 py-2 text-slate-500">{l.ip ?? '—'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    Belum ada aktivitas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
