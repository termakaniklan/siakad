import { prisma } from '@/shared/db/prisma';

/**
 * Convenience helper for write actions: persist an `AuditLog` row tying the
 * actor (resolved from the principal) to the entity that changed.
 *
 * Always best-effort — if the audit insert fails we log it but never block the
 * primary mutation. Audit gaps must be tolerable; what we can't tolerate is a
 * mutation that secretly succeeds because audit failed.
 */
export async function audit(opts: {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  ip?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: opts.actorUserId,
        action: opts.action,
        entityType: opts.entityType,
        entityId: opts.entityId,
        ip: opts.ip ?? null,
        metadata: opts.metadata as object | undefined,
      },
    });
  } catch {
    /* swallow */
  }
}
