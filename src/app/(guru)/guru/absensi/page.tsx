import { redirect } from 'next/navigation';

import { AttendanceForm } from '@/components/guru/attendance-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPrincipal } from '@/modules/auth/principal';
import { PERMISSIONS, ROLES } from '@/modules/rbac/permissions';
import { hasAnyPermission } from '@/modules/rbac/policy';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams?: { classId?: string; date?: string };
}

export default async function GuruAbsensiPage({ searchParams }: Props) {
  const principal = await getPrincipal();
  if (!principal) redirect('/login');
  if (!hasAnyPermission(principal, PERMISSIONS.ATTENDANCE_MANAGE)) redirect('/guru');

  const isAdmin = principal.roleCodes.some((c) =>
    [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.OPERATOR].includes(c as never),
  );

  // Limit the class list to either every class (admin) or kelas perwalian guru.
  const classes = await prisma.class.findMany({
    where: {
      deletedAt: null,
      ...(isAdmin ? {} : { homeroomTeacherId: principal.userId }),
    },
    select: { id: true, name: true, level: true },
    orderBy: [{ level: 'asc' }, { name: 'asc' }],
  });

  const selectedId = searchParams?.classId;
  const date =
    searchParams?.date && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date)
      ? searchParams.date
      : new Date().toISOString().slice(0, 10);

  let students: { id: string; fullName: string; nis: string | null }[] = [];
  const existingMarks: Record<string, { status: string; notes: string | null }> = {};
  if (selectedId && classes.some((c) => c.id === selectedId)) {
    const enrollments = await prisma.classEnrollment.findMany({
      where: { classId: selectedId, deletedAt: null },
      select: {
        student: { select: { id: true, fullName: true, nis: true } },
      },
      orderBy: { student: { fullName: 'asc' } },
    });
    students = enrollments.map((e) => e.student);
    const dayStart = new Date(date + 'T00:00:00.000Z');
    const dayEnd = new Date(date + 'T23:59:59.999Z');
    const marks = await prisma.attendanceMark.findMany({
      where: {
        studentId: { in: students.map((s) => s.id) },
        date: { gte: dayStart, lte: dayEnd },
      },
      select: { studentId: true, status: true, notes: true },
    });
    for (const m of marks) {
      existingMarks[m.studentId] = { status: m.status, notes: m.notes };
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">Absensi Kelas</h1>
        <p className="text-sm text-slate-500">
          Tandai kehadiran siswa untuk tanggal & kelas yang dipilih. Hanya kelas perwalian Anda yang
          muncul (admin: semua kelas).
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pilih Kelas & Tanggal</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-3">
            <div className="grid gap-1">
              <label className="text-xs uppercase text-slate-500" htmlFor="classId">
                Kelas
              </label>
              <select
                id="classId"
                name="classId"
                defaultValue={selectedId ?? ''}
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="">— pilih —</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.level} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-xs uppercase text-slate-500" htmlFor="date">
                Tanggal
              </label>
              <input
                id="date"
                name="date"
                type="date"
                defaultValue={date}
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="h-9 rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
              >
                Tampilkan
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {selectedId && students.length > 0 && (
        <AttendanceForm
          classId={selectedId}
          date={date}
          students={students.map((s) => ({
            id: s.id,
            fullName: s.fullName,
            nis: s.nis,
            initial: existingMarks[s.id] ?? { status: 'present', notes: null },
          }))}
        />
      )}

      {selectedId && students.length === 0 && (
        <Card>
          <CardContent className="py-6 text-sm text-slate-500">
            Tidak ada siswa pada kelas tersebut.
          </CardContent>
        </Card>
      )}

      {classes.length === 0 && (
        <Card>
          <CardContent className="py-6 text-sm text-slate-500">
            Anda belum tercatat sebagai wali kelas. Hubungi admin untuk pemetaan kelas perwalian.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
