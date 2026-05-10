import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GuruModulePlaceholder({ params }: { params: { slug: string[] } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{params.slug.join(' › ')}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-slate-600 dark:text-slate-400">
        Modul guru <code>/guru/{params.slug.join('/')}</code> akan menampilkan data sesuai
        prinsipal. Implementasi data binding tinggal ditambahkan menggunakan model Prisma yang
        relevan (`Class`, `ClassSchedule`, `AttendanceMark`, `Exam`, `Question`, `MaterialUpload`,
        dst.)
      </CardContent>
    </Card>
  );
}
