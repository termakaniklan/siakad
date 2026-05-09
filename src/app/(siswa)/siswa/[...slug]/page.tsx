import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SiswaModulePlaceholder({ params }: { params: { slug: string[] } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{params.slug.join(' › ')}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-slate-600 dark:text-slate-400">
        Modul siswa <code>/siswa/{params.slug.join('/')}</code> akan menampilkan data sesuai
        prinsipal saat ini. Implementasi data binding tinggal ditambahkan menggunakan model Prisma
        yang relevan.
      </CardContent>
    </Card>
  );
}
