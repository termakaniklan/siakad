import { describe, expect, it } from 'vitest';

describe('rbac', () => {
  it('super_admin has every permission', async () => {
    const { defaultRolePermissions, ALL_PERMISSIONS, ROLES } =
      await import('@/modules/rbac/permissions');
    const perms = defaultRolePermissions[ROLES.SUPER_ADMIN];
    expect(new Set(perms)).toEqual(new Set(ALL_PERMISSIONS));
  });

  it('guru has grade.input but not user.manage', async () => {
    const { defaultRolePermissions, PERMISSIONS, ROLES } =
      await import('@/modules/rbac/permissions');
    const guru = new Set(defaultRolePermissions[ROLES.GURU]);
    expect(guru.has(PERMISSIONS.GRADE_INPUT)).toBe(true);
    expect(guru.has(PERMISSIONS.USER_MANAGE)).toBe(false);
  });

  it('hasAnyPermission returns true when principal has at least one match', async () => {
    const { hasAnyPermission } = await import('@/modules/rbac/policy');
    const { PERMISSIONS } = await import('@/modules/rbac/permissions');
    const principal = {
      userId: 'u1',
      roleCodes: ['admin'],
      permissionCodes: [PERMISSIONS.USER_MANAGE],
    };
    expect(hasAnyPermission(principal, PERMISSIONS.USER_MANAGE)).toBe(true);
    expect(hasAnyPermission(principal, PERMISSIONS.PERMISSION_MANAGE)).toBe(false);
  });
});
