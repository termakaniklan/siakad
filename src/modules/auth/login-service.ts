import { randomUUID } from 'node:crypto';

import { z } from 'zod';

import { getSession } from '@/modules/auth/session';
import { defaultRolePermissions, type PermissionCode } from '@/modules/rbac/permissions';
import { prisma } from '@/shared/db/prisma';
import { logger } from '@/shared/logger';
import { verifyCaptcha } from '@/shared/security/captcha';
import { verifyPassword } from '@/shared/security/passwords';
import { rateLimit } from '@/shared/security/rate-limit';
import { env } from '@/shared/config/env';

export const loginSchema = z.object({
  identifier: z.string().min(3, 'Username/email minimal 3 karakter.').max(120),
  password: z.string().min(1, 'Password wajib diisi.').max(256),
  captchaToken: z.string().min(1, 'Captcha wajib diisi.'),
  captchaAnswer: z.string().min(1, 'Jawaban captcha wajib diisi.'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface LoginContext {
  ip: string;
  userAgent: string;
}

export type LoginResult =
  | { ok: true; userId: string }
  | { ok: false; error: string; rateLimited?: boolean };

/**
 * Login service.
 *
 * Defense-in-depth ordering:
 *   1. Captcha (cheap, blocks bots before DB lookups)
 *   2. Rate limit (per identifier + per IP, fail-closed on Redis blip)
 *   3. Password verify (Argon2id, constant time)
 *   4. Session bind + audit log
 *
 * The "user not found" and "wrong password" paths are intentionally indistinguishable.
 */
export async function authenticate(input: LoginInput, ctx: LoginContext): Promise<LoginResult> {
  if (!verifyCaptcha({ token: input.captchaToken, answer: input.captchaAnswer })) {
    return { ok: false, error: 'Captcha tidak valid atau kedaluwarsa.' };
  }

  const ipKey = `login:ip:${ctx.ip}`;
  const userKey = `login:id:${input.identifier.toLowerCase()}`;
  const [byIp, byUser] = await Promise.all([
    rateLimit(ipKey, env.RATE_LIMIT_LOGIN_PER_MINUTE * 4, 60),
    rateLimit(userKey, env.RATE_LIMIT_LOGIN_PER_MINUTE, 60),
  ]);
  if (!byIp.allowed || !byUser.allowed) {
    return {
      ok: false,
      error: 'Terlalu banyak percobaan. Silakan coba lagi sebentar.',
      rateLimited: true,
    };
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.identifier.toLowerCase() }, { username: input.identifier }],
      deletedAt: null,
    },
    include: {
      roles: {
        where: { deletedAt: null },
        include: { permissions: { where: { deletedAt: null } } },
      },
    },
  });

  if (!user || !user.passwordHash || !user.isActive) {
    logger.warn({ identifier: input.identifier, ip: ctx.ip }, 'login.invalid_user');
    return { ok: false, error: 'Kredensial tidak valid.' };
  }

  const ok = await verifyPassword(user.passwordHash, input.password);
  if (!ok) {
    logger.warn({ userId: user.id, ip: ctx.ip }, 'login.invalid_password');
    await prisma.loginAttempt.create({
      data: {
        userId: user.id,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        success: false,
        reason: 'invalid_password',
      },
    });
    return { ok: false, error: 'Kredensial tidak valid.' };
  }

  // Build effective permission set: union of all role-derived permissions.
  // We use `defaultRolePermissions` as the source of truth for the seeded baseline,
  // but additionally include any explicit permission rows attached to user roles.
  const permissionCodes = new Set<PermissionCode>();
  for (const role of user.roles) {
    const baseline = defaultRolePermissions[role.code as keyof typeof defaultRolePermissions];
    if (baseline) for (const p of baseline) permissionCodes.add(p);
    for (const p of role.permissions) permissionCodes.add(p.code as PermissionCode);
  }

  const sessionRow = await prisma.userSession.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      rememberMe: input.rememberMe,
      expiresAt: new Date(
        Date.now() +
          (input.rememberMe
            ? env.AUTH_REMEMBER_ME_TTL_DAYS * 86_400_000
            : env.AUTH_SESSION_TTL_HOURS * 3_600_000),
      ),
    },
  });

  const session = await getSession();
  session.userId = user.id;
  session.sessionId = sessionRow.id;
  session.roleCodes = user.roles.map((r) => r.code);
  session.permissionCodes = [...permissionCodes];
  session.rememberMe = input.rememberMe;
  session.createdAt = Date.now();
  session.lastSeenAt = Date.now();
  session.ip = ctx.ip;
  session.userAgent = ctx.userAgent;
  await session.save();

  await prisma.loginAttempt.create({
    data: { userId: user.id, ip: ctx.ip, userAgent: ctx.userAgent, success: true },
  });
  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: 'auth.login',
      entityType: 'UserSession',
      entityId: sessionRow.id,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      metadata: { rememberMe: input.rememberMe },
    },
  });

  return { ok: true, userId: user.id };
}
