import { redirect } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPrincipal } from '@/modules/auth/principal';
import { PERMISSIONS } from '@/modules/rbac/permissions';
import { hasAnyPermission } from '@/modules/rbac/policy';

export const dynamic = 'force-dynamic';

export default async function HealthPage() {
  const principal = await getPrincipal();
  if (!hasAnyPermission(principal, PERMISSIONS.SYSTEM_HEALTH_VIEW)) redirect('/admin');
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Health Check</h1>
      <Card>
        <CardHeader>
          <CardTitle>Probe</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          Endpoint live: <code>/api/health</code>. Memeriksa konektivitas database (MariaDB) dan
          Redis. Gunakan endpoint ini untuk liveness &amp; readiness probe (mis. systemd
          <code>ExecStartPost</code> / load balancer health check).
        </CardContent>
      </Card>
    </div>
  );
}
