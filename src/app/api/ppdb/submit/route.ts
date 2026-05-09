import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/shared/db/prisma';
import { logger } from '@/shared/logger';
import { rateLimit } from '@/shared/security/rate-limit';

const schema = z.object({
  fullName: z.string().min(2).max(120),
  birthPlace: z.string().min(2).max(80),
  birthDate: z.string().min(8).max(20),
  nisn: z.string().max(40).optional().or(z.literal('')),
  studentAddress: z.string().min(5).max(500),
  fatherName: z.string().min(2).max(120),
  motherName: z.string().min(2).max(120),
  guardianName: z.string().max(120).optional().or(z.literal('')),
  parentAddress: z.string().min(5).max(500),
  provinceId: z.string().min(1),
  regencyId: z.string().min(1),
  districtId: z.string().min(1),
  villageId: z.string().min(1),
  postalCode: z.string().max(10).optional().or(z.literal('')),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().max(40).optional().or(z.literal('')),
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0';
  const rl = await rateLimit(`ppdb:${ip}`, 8, 60);
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, message: 'Terlalu banyak percobaan.' }, { status: 429 });
  }

  let parsed;
  try {
    parsed = schema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload tidak valid.' }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? 'Validasi gagal.' },
      { status: 400 },
    );
  }

  const setting = await prisma.setting.findUnique({ where: { key: 'ppdb.is_open' } });
  if (!setting?.value) {
    return NextResponse.json(
      { ok: false, message: 'Pendaftaran sedang ditutup.' },
      { status: 403 },
    );
  }
  const academicYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
  if (!academicYear) {
    return NextResponse.json(
      { ok: false, message: 'Tahun ajaran aktif belum diatur.' },
      { status: 503 },
    );
  }

  const data = parsed.data;
  const created = await prisma.ppdbApplication.create({
    data: {
      academicYearId: academicYear.id,
      status: 'submitted',
      fullName: data.fullName,
      birthPlace: data.birthPlace,
      birthDate: new Date(data.birthDate),
      nisn: data.nisn ? data.nisn : null,
      studentAddress: data.studentAddress,
      fatherName: data.fatherName,
      motherName: data.motherName,
      guardianName: data.guardianName ? data.guardianName : null,
      parentAddress: data.parentAddress,
      provinceId: data.provinceId,
      regencyId: data.regencyId,
      districtId: data.districtId,
      villageId: data.villageId,
      postalCode: data.postalCode || null,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      submittedAt: new Date(),
    },
    select: { numericId: true, id: true },
  });

  logger.info({ applicationId: created.id, numericId: created.numericId }, 'ppdb.submitted');
  return NextResponse.json({ ok: true, numericId: created.numericId });
}
