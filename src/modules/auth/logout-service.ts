import { destroySession, getSession } from '@/modules/auth/session';
import { prisma } from '@/shared/db/prisma';

export async function logout(): Promise<void> {
  const session = await getSession();
  const sid = session.sessionId;
  if (sid) {
    await prisma.userSession.update({
      where: { id: sid },
      data: { revokedAt: new Date() },
    });
    await prisma.auditLog.create({
      data: {
        actorUserId: session.userId ?? null,
        action: 'auth.logout',
        entityType: 'UserSession',
        entityId: sid,
        ip: session.ip ?? null,
        userAgent: session.userAgent ?? null,
      },
    });
  }
  await destroySession();
}
