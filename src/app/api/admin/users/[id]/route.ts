import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getPrincipal } from '@/modules/auth/principal';
import { PERMISSIONS } from '@/modules/rbac/permissions';
import { hasAnyPermission } from '@/modules/rbac/policy';
import { prisma } from '@/shared/db/prisma';
import { audit } from '@/shared/security/audit';
import { hashPassword } from '@/shared/security/passwords';

const idSchema = z.string().uuid();

const updateSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  phone: z.string().max(32).nullable().optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(10).max(256).optional(),
  roleCodes: z.array(z.string().min(1).max(64)).max(8).optional(),
});

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const principal = await getPrincipal();
  if (!hasAnyPermission(principal, PERMISSIONS.USER_MANAGE)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const idCheck = idSchema.safeParse(ctx.params.id);
  if (!idCheck.success) return NextResponse.json({ ok: false }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { id: idCheck.data } });
  if (!existing || existing.deletedAt) return NextResponse.json({ ok: false }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (parsed.data.fullName !== undefined) data.fullName = parsed.data.fullName;
  if (parsed.data.phone !== undefined) data.phone = parsed.data.phone;
  if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive;
  if (parsed.data.password !== undefined) {
    data.passwordHash = await hashPassword(parsed.data.password);
    // also revoke other sessions to evict stale auth
  }

  await prisma.user.update({ where: { id: idCheck.data }, data });
  if (parsed.data.roleCodes !== undefined) {
    const roles = await prisma.role.findMany({
      where: { code: { in: parsed.data.roleCodes } },
    });
    await prisma.user.update({
      where: { id: idCheck.data },
      data: { roles: { set: roles.map((r) => ({ id: r.id })) } },
    });
  }
  if (parsed.data.password !== undefined) {
    await prisma.userSession.updateMany({
      where: { userId: idCheck.data, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  await audit({
    actorUserId: principal!.userId,
    action: 'admin.user.update',
    entityType: 'User',
    entityId: idCheck.data,
    metadata: parsed.data as Record<string, unknown>,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const principal = await getPrincipal();
  if (!hasAnyPermission(principal, PERMISSIONS.USER_MANAGE)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const idCheck = idSchema.safeParse(ctx.params.id);
  if (!idCheck.success) return NextResponse.json({ ok: false }, { status: 400 });
  if (idCheck.data === principal!.userId) {
    return NextResponse.json(
      { ok: false, message: 'Anda tidak dapat menghapus akun sendiri.' },
      { status: 400 },
    );
  }
  await prisma.user.update({
    where: { id: idCheck.data },
    data: { deletedAt: new Date(), isActive: false },
  });
  await prisma.userSession.updateMany({
    where: { userId: idCheck.data, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  await audit({
    actorUserId: principal!.userId,
    action: 'admin.user.delete',
    entityType: 'User',
    entityId: idCheck.data,
  });
  return NextResponse.json({ ok: true });
}
