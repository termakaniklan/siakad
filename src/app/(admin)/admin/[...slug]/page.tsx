import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Catch-all admin placeholder.
 *
 * The full admin matrix (academic year, classes, subjects, exam config, payment config, etc.)
 * is wired into the menu via `src/components/admin/shell.tsx`. Each leaf is intentionally
 * kept as a placeholder in this commit so the navigation graph is testable end-to-end and
 * additional CRUDs can be added incrementally without changing routing.
 */
export default function AdminPlaceholderPage({ params }: { params: { slug: string[] } }) {
  const path = params.slug.join(' / ');
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold capitalize">Modul: {params.slug.join(' › ')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Modul belum diisi</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 dark:text-slate-400">
          <p>
            Path <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">/admin/{path}</code>{' '}
            telah disiapkan kerangkanya. Tambahkan halaman konkret pada
            <code className="ml-1 rounded bg-slate-100 px-1 dark:bg-slate-800">
              src/app/(admin)/admin/{params.slug.join('/')}
            </code>
            .
          </p>
          <p className="mt-2">
            Skema database, RBAC, dan API helpers sudah tersedia — gunakan helper{' '}
            <code>getPrincipal()</code>, <code>hasAnyPermission()</code>, dan model Prisma yang
            relevan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
