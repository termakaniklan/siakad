/**
 * Canonical permission catalog.
 *
 * Permissions follow `<resource>.<action>` convention. Roles are mapped to permission
 * sets (see `defaultRolePermissions`). The DB Role/Permission tables mirror this map
 * via the seeder (`prisma/seed.ts`); the catalog here is the source of truth.
 */
export const PERMISSIONS = {
  // System
  SYSTEM_HEALTH_VIEW: 'system.health.view',
  AUDIT_LOG_VIEW: 'audit.log.view',
  SETTINGS_MANAGE: 'settings.manage',
  BACKUP_MANAGE: 'backup.manage',

  // RBAC
  USER_VIEW: 'user.view',
  USER_MANAGE: 'user.manage',
  ROLE_VIEW: 'role.view',
  ROLE_MANAGE: 'role.manage',
  PERMISSION_MANAGE: 'permission.manage',
  MENU_MANAGE: 'menu.manage',

  // Academic
  ACADEMIC_YEAR_MANAGE: 'academic.year.manage',
  CLASS_MANAGE: 'academic.class.manage',
  SUBJECT_MANAGE: 'academic.subject.manage',
  KKM_MANAGE: 'academic.kkm.manage',
  SCHEDULE_MANAGE: 'academic.schedule.manage',
  ATTENDANCE_MANAGE: 'academic.attendance.manage',
  VIOLATION_MANAGE: 'academic.violation.manage',
  GRADE_VIEW: 'academic.grade.view',
  GRADE_INPUT: 'academic.grade.input',
  MATERIAL_UPLOAD: 'academic.material.upload',

  // Exams / CBT
  EXAM_MANAGE: 'exam.manage',
  EXAM_TAKE: 'exam.take',
  EXAM_RESULT_VIEW: 'exam.result.view',
  CBT_CONFIG_MANAGE: 'cbt.config.manage',

  // CMS
  CMS_PAGE_MANAGE: 'cms.page.manage',
  CMS_NEWS_MANAGE: 'cms.news.manage',
  CMS_GALLERY_MANAGE: 'cms.gallery.manage',
  CMS_ANNOUNCEMENT_MANAGE: 'cms.announcement.manage',
  CMS_THEME_MANAGE: 'cms.theme.manage',
  CMS_SEO_MANAGE: 'cms.seo.manage',

  // PPDB
  PPDB_APPLY: 'ppdb.apply',
  PPDB_REVIEW: 'ppdb.review',
  PPDB_MANAGE: 'ppdb.manage',

  // Notifications
  NOTIFICATION_SEND: 'notification.send',
  NOTIFICATION_CONFIG_MANAGE: 'notification.config.manage',

  // Payment
  PAYMENT_CONFIG_MANAGE: 'payment.config.manage',
  PAYMENT_VIEW: 'payment.view',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionCode = (typeof PERMISSIONS)[PermissionKey];

export const ALL_PERMISSIONS: ReadonlyArray<PermissionCode> = Object.values(PERMISSIONS);

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  OPERATOR: 'operator',
  GURU: 'guru',
  WALI_KELAS: 'wali_kelas',
  SISWA: 'siswa',
  ORANG_TUA: 'orang_tua',
} as const;

export type RoleCode = (typeof ROLES)[keyof typeof ROLES];

export const defaultRolePermissions: Record<RoleCode, ReadonlyArray<PermissionCode>> = {
  [ROLES.SUPER_ADMIN]: ALL_PERMISSIONS,
  [ROLES.ADMIN]: ALL_PERMISSIONS.filter(
    (p) => p !== PERMISSIONS.PERMISSION_MANAGE && p !== PERMISSIONS.BACKUP_MANAGE,
  ),
  [ROLES.OPERATOR]: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.CLASS_MANAGE,
    PERMISSIONS.SUBJECT_MANAGE,
    PERMISSIONS.SCHEDULE_MANAGE,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.CMS_NEWS_MANAGE,
    PERMISSIONS.CMS_ANNOUNCEMENT_MANAGE,
    PERMISSIONS.PPDB_REVIEW,
    PERMISSIONS.NOTIFICATION_SEND,
  ],
  [ROLES.GURU]: [
    PERMISSIONS.GRADE_INPUT,
    PERMISSIONS.GRADE_VIEW,
    PERMISSIONS.MATERIAL_UPLOAD,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.VIOLATION_MANAGE,
    PERMISSIONS.EXAM_MANAGE,
    PERMISSIONS.EXAM_RESULT_VIEW,
    PERMISSIONS.NOTIFICATION_SEND,
  ],
  [ROLES.WALI_KELAS]: [
    PERMISSIONS.GRADE_INPUT,
    PERMISSIONS.GRADE_VIEW,
    PERMISSIONS.MATERIAL_UPLOAD,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.VIOLATION_MANAGE,
    PERMISSIONS.EXAM_MANAGE,
    PERMISSIONS.EXAM_RESULT_VIEW,
    PERMISSIONS.NOTIFICATION_SEND,
  ],
  [ROLES.SISWA]: [PERMISSIONS.EXAM_TAKE, PERMISSIONS.GRADE_VIEW, PERMISSIONS.EXAM_RESULT_VIEW],
  [ROLES.ORANG_TUA]: [PERMISSIONS.GRADE_VIEW, PERMISSIONS.EXAM_RESULT_VIEW],
};
