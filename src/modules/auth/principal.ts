import type { PermissionCode } from '@/modules/rbac/permissions';

import { getSession } from '@/modules/auth/session';

export interface Principal {
  userId: string;
  sessionId: string;
  roleCodes: ReadonlyArray<string>;
  permissionCodes: ReadonlyArray<PermissionCode>;
}

/** Returns the authenticated principal or null if the session is anonymous. */
export async function getPrincipal(): Promise<Principal | null> {
  const session = await getSession();
  if (!session.userId || !session.sessionId) return null;
  return {
    userId: session.userId,
    sessionId: session.sessionId,
    roleCodes: session.roleCodes ?? [],
    permissionCodes: (session.permissionCodes ?? []) as ReadonlyArray<PermissionCode>,
  };
}
