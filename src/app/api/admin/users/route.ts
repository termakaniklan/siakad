import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getPrincipal } from '@/modules/auth/principal';
import { PERMISSIONS } from '@/modules/rbac/permissions';
import { hasAnyPermission } from '@/modules/rbac/policy';
import { prisma } from '@/shared/db/prisma';
import { audit } from '@/shared/security/audit';
import { hashPassword } from '@/shared/security/passwords';

const createSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(64)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username hanya huruf/angka/._- saja.'),
  fullName: z.string().min(2).max(120),
  phone: z.string().max(32).optional().nullable(),
  password: z.string().min(10).max(256),
  isActive: z.boolean().default(true),
  roleCodes: z.array(z.string().min(1).max(64)).max(8).default([]),
});

export async function POST(req: Request) {
  const principal = await getPrincipal();
  if (!hasAnyPermission(principal, PERMISSIONS.USER_MANAGE)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? 'Validasi gagal.' },
      { status: 400 },
    );
  }
  // Pre-check uniqueness so we can give a clear error message.
  const collision = await prisma.user.findFirst({
    where: { OR: [{ email: parsed.data.email }, { username: parsed.data.username }] },
    select: { id: true },
  });
  if (collision) {
    return NextResponse.json(
      { ok: false, message: 'Email/username sudah dipakai.' },
      { status: 409 },
    );
  }
  const roles =
    parsed.data.roleCodes.length > 0
      ? await prisma.role.findMany({ where: { code: { in: parsed.data.roleCodes } } })
      : [];
  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      username: parsed.data.username,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone ?? null,
      isActive: parsed.data.isActive,
      passwordHash,
      roles: { connect: roles.map((r) => ({ id: r.id })) },
    },
    select: { id: true, fullName: true },
  });
  await audit({
    actorUserId: principal!.userId,
    action: 'admin.user.create',
    entityType: 'User',
    entityId: user.id,
    metadata: { roles: roles.map((r) => r.code) },
  });
  return NextResponse.json({ ok: true, user });
}
