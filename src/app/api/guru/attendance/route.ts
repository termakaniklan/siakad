import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getPrincipal } from '@/modules/auth/principal';
import { PERMISSIONS, ROLES } from '@/modules/rbac/permissions';
import { hasAnyPermission } from '@/modules/rbac/policy';
import { prisma } from '@/shared/db/prisma';
import { audit } from '@/shared/security/audit';

/**
 * POST /api/guru/attendance — bulk upsert kehadiran untuk satu kelas pada satu tanggal.
 *
 * Defense-in-depth:
 * - Permission `ATTENDANCE_INPUT` dicek di prinsipal.
 * - Kelas WAJIB dimiliki oleh guru (homeroomTeacherId === principal.userId)
 *   ATAU principal punya role admin. Tanpa pemilikan ini, request 403.
 * - Setiap studentId yang dikirim diverifikasi sebagai enrollment aktif di
 *   kelas tersebut sehingga payload "studentId milik kelas lain" diabaikan.
 * - Status disempitkan ke enum tetap.
 */
const STATUSES = ['present', 'absent', 'sick', 'permission', 'late'] as const;

const schema = z.object({
  classId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  marks: z
    .array(
      z.object({
        studentId: z.string().uuid(),
        status: z.enum(STATUSES),
        notes: z.string().max(280).optional().nullable(),
      }),
    )
    .min(1)
    .max(200),
});

export async function POST(req: Request) {
  const principal = await getPrincipal();
  if (!hasAnyPermission(principal, PERMISSIONS.ATTENDANCE_MANAGE)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? 'Validasi gagal.' },
      { status: 400 },
    );
  }

  const klass = await prisma.class.findUnique({
    where: { id: parsed.data.classId },
    select: { id: true, homeroomTeacherId: true, deletedAt: true },
  });
  if (!klass || klass.deletedAt) return NextResponse.json({ ok: false }, { status: 404 });
  const isAdmin = principal!.roleCodes.some((c) =>
    [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.OPERATOR].includes(c as never),
  );
  if (!isAdmin && klass.homeroomTeacherId !== principal!.userId) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  // Filter out any student id that is not actually enrolled in the class.
  const enrollments = await prisma.classEnrollment.findMany({
    where: {
      classId: parsed.data.classId,
      deletedAt: null,
      studentId: { in: parsed.data.marks.map((m) => m.studentId) },
    },
    select: { studentId: true },
  });
  const allowed = new Set(enrollments.map((e) => e.studentId));
  const cleanMarks = parsed.data.marks.filter((m) => allowed.has(m.studentId));

  const dateOnly = new Date(parsed.data.date + 'T00:00:00.000Z');
  const dayStart = new Date(dateOnly);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(dateOnly);
  dayEnd.setUTCHours(23, 59, 59, 999);

  // Best-effort upsert: clear existing marks for the day for this class's enrollees,
  // then create new marks. Wrapped in a transaction to keep state consistent.
  await prisma.$transaction(async (tx) => {
    await tx.attendanceMark.deleteMany({
      where: {
        date: { gte: dayStart, lte: dayEnd },
        studentId: { in: cleanMarks.map((m) => m.studentId) },
      },
    });
    if (cleanMarks.length > 0) {
      await tx.attendanceMark.createMany({
        data: cleanMarks.map((m) => ({
          studentId: m.studentId,
          date: dateOnly,
          status: m.status,
          notes: m.notes ?? null,
          markedBy: principal!.userId,
        })),
      });
    }
  });

  await audit({
    actorUserId: principal!.userId,
    action: 'guru.attendance.upsert',
    entityType: 'AttendanceMark',
    entityId: parsed.data.classId,
    metadata: { date: parsed.data.date, count: cleanMarks.length },
  });

  return NextResponse.json({ ok: true, count: cleanMarks.length });
}
