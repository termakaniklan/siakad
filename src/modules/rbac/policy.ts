import type { PermissionCode } from '@/modules/rbac/permissions';

export interface PrincipalLike {
  userId: string;
  roleCodes: ReadonlyArray<string>;
  permissionCodes: ReadonlyArray<PermissionCode>;
}

/**
 * Policy primitive: returns true when the principal has *any* of the given permissions.
 */
export function hasAnyPermission(
  principal: PrincipalLike | null | undefined,
  ...required: ReadonlyArray<PermissionCode>
): boolean {
  if (!principal) return false;
  if (required.length === 0) return true;
  for (const p of required) if (principal.permissionCodes.includes(p)) return true;
  return false;
}

export function hasAllPermissions(
  principal: PrincipalLike | null | undefined,
  ...required: ReadonlyArray<PermissionCode>
): boolean {
  if (!principal) return false;
  for (const p of required) if (!principal.permissionCodes.includes(p)) return false;
  return true;
}

/** Throws a domain error suitable for translating to HTTP 403. */
export class AuthorizationError extends Error {
  constructor(message = 'Akses ditolak') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export function authorize(
  principal: PrincipalLike | null | undefined,
  ...required: ReadonlyArray<PermissionCode>
): asserts principal is PrincipalLike {
  if (!hasAnyPermission(principal, ...required)) {
    throw new AuthorizationError();
  }
}
