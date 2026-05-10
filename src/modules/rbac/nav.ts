/**
 * Central navigation catalogue.
 *
 * Every nav item declares which roles AND/OR permissions are required to see it.
 * The portal shell filters this catalogue per principal at render time, and each
 * destination route ALSO enforces the same guard server-side, so a malicious
 * client cannot reveal hidden routes by tampering with the DOM.
 */
import { PERMISSIONS, ROLES, type PermissionCode, type RoleCode } from './permissions';

export interface NavItem {
  label: string;
  href: string;
  /** If set, principal must have at least one of these role codes. */
  anyRole?: ReadonlyArray<RoleCode>;
  /** If set, principal must hold at least one of these permission codes. */
  anyPermission?: ReadonlyArray<PermissionCode>;
}

export interface NavGroup {
  label: string;
  items: ReadonlyArray<NavItem>;
}

export interface NavCatalogue {
  /** Logical portal id used by the shell. */
  portal: 'siswa' | 'orangtua' | 'guru' | 'admin';
  /** Pretty title shown in the header. */
  title: string;
  subtitle?: string;
  groups: ReadonlyArray<NavGroup>;
}

export const SISWA_NAV: NavCatalogue = {
  portal: 'siswa',
  title: 'Portal Siswa',
  subtitle: 'Akses jadwal, nilai, ujian, kehadiran.',
  groups: [
    {
      label: 'Beranda',
      items: [{ label: 'Dashboard', href: '/siswa', anyRole: [ROLES.SISWA] }],
    },
    {
      label: 'Akademik',
      items: [
        { label: 'Jadwal', href: '/siswa/jadwal', anyRole: [ROLES.SISWA] },
        {
          label: 'Nilai',
          href: '/siswa/nilai',
          anyRole: [ROLES.SISWA],
          anyPermission: [PERMISSIONS.GRADE_VIEW],
        },
        {
          label: 'Ujian',
          href: '/siswa/ujian',
          anyRole: [ROLES.SISWA],
          anyPermission: [PERMISSIONS.EXAM_TAKE],
        },
        { label: 'Kehadiran', href: '/siswa/kehadiran', anyRole: [ROLES.SISWA] },
        { label: 'Materi', href: '/siswa/materi', anyRole: [ROLES.SISWA] },
      ],
    },
    {
      label: 'Akun',
      items: [
        { label: 'Pengumuman', href: '/siswa/pengumuman', anyRole: [ROLES.SISWA] },
        { label: 'Profil Saya', href: '/akun/profil' },
      ],
    },
  ],
};

export const ORANGTUA_NAV: NavCatalogue = {
  portal: 'orangtua',
  title: 'Portal Orang Tua / Wali',
  subtitle: 'Pantau perkembangan akademik dan kehadiran anak Anda.',
  groups: [
    {
      label: 'Beranda',
      items: [{ label: 'Dashboard', href: '/orangtua', anyRole: [ROLES.ORANG_TUA] }],
    },
    {
      label: 'Anak Saya',
      items: [
        { label: 'Daftar Anak', href: '/orangtua/anak', anyRole: [ROLES.ORANG_TUA] },
        { label: 'Kehadiran', href: '/orangtua/kehadiran', anyRole: [ROLES.ORANG_TUA] },
        {
          label: 'Nilai',
          href: '/orangtua/nilai',
          anyRole: [ROLES.ORANG_TUA],
          anyPermission: [PERMISSIONS.GRADE_VIEW],
        },
        {
          label: 'Ujian',
          href: '/orangtua/ujian',
          anyRole: [ROLES.ORANG_TUA],
          anyPermission: [PERMISSIONS.EXAM_RESULT_VIEW],
        },
      ],
    },
    {
      label: 'Akun',
      items: [
        { label: 'Pengumuman', href: '/orangtua/pengumuman', anyRole: [ROLES.ORANG_TUA] },
        { label: 'Profil Saya', href: '/akun/profil' },
      ],
    },
  ],
};

export const GURU_NAV: NavCatalogue = {
  portal: 'guru',
  title: 'Portal Guru',
  subtitle: 'Kelola pembelajaran, nilai, kehadiran kelas.',
  groups: [
    {
      label: 'Beranda',
      items: [{ label: 'Dashboard', href: '/guru', anyRole: [ROLES.GURU, ROLES.WALI_KELAS] }],
    },
    {
      label: 'Pembelajaran',
      items: [
        {
          label: 'Kelas Saya',
          href: '/guru/kelas',
          anyRole: [ROLES.GURU, ROLES.WALI_KELAS],
        },
        {
          label: 'Jadwal Mengajar',
          href: '/guru/jadwal',
          anyRole: [ROLES.GURU, ROLES.WALI_KELAS],
        },
        {
          label: 'Materi',
          href: '/guru/materi',
          anyRole: [ROLES.GURU, ROLES.WALI_KELAS],
          anyPermission: [PERMISSIONS.MATERIAL_UPLOAD],
        },
      ],
    },
    {
      label: 'Penilaian',
      items: [
        {
          label: 'Input Nilai',
          href: '/guru/nilai',
          anyRole: [ROLES.GURU, ROLES.WALI_KELAS],
          anyPermission: [PERMISSIONS.GRADE_INPUT],
        },
        {
          label: 'Bank Soal',
          href: '/guru/bank-soal',
          anyRole: [ROLES.GURU, ROLES.WALI_KELAS],
          anyPermission: [PERMISSIONS.EXAM_MANAGE],
        },
        {
          label: 'Ujian Saya',
          href: '/guru/ujian',
          anyRole: [ROLES.GURU, ROLES.WALI_KELAS],
          anyPermission: [PERMISSIONS.EXAM_MANAGE],
        },
      ],
    },
    {
      label: 'Kehadiran',
      items: [
        {
          label: 'Absensi Kelas',
          href: '/guru/absensi',
          anyRole: [ROLES.GURU, ROLES.WALI_KELAS],
          anyPermission: [PERMISSIONS.ATTENDANCE_MANAGE],
        },
        {
          label: 'Pelanggaran',
          href: '/guru/pelanggaran',
          anyRole: [ROLES.GURU, ROLES.WALI_KELAS],
          anyPermission: [PERMISSIONS.VIOLATION_MANAGE],
        },
      ],
    },
    {
      label: 'Akun',
      items: [{ label: 'Profil Saya', href: '/akun/profil' }],
    },
  ],
};

interface PrincipalLike {
  roleCodes: ReadonlyArray<string>;
  permissionCodes: ReadonlyArray<string>;
}

export function isAllowed(principal: PrincipalLike, item: NavItem): boolean {
  if (item.anyRole && item.anyRole.length > 0) {
    const hasRole = item.anyRole.some((r) => principal.roleCodes.includes(r));
    if (!hasRole) return false;
  }
  if (item.anyPermission && item.anyPermission.length > 0) {
    const hasPerm = item.anyPermission.some((p) => principal.permissionCodes.includes(p));
    if (!hasPerm) return false;
  }
  return true;
}

export function filterNav(catalogue: NavCatalogue, principal: PrincipalLike): NavCatalogue {
  return {
    ...catalogue,
    groups: catalogue.groups
      .map((g) => ({ ...g, items: g.items.filter((i) => isAllowed(principal, i)) }))
      .filter((g) => g.items.length > 0),
  };
}

/**
 * Resolve where a principal should land after login. Higher-privilege portals
 * are tried first so an admin who is also tagged `siswa` (test fixture) lands
 * on `/admin`.
 */
export function landingPathForRoles(roleCodes: ReadonlyArray<string>): string {
  const codes = new Set(roleCodes);
  if (codes.has(ROLES.SUPER_ADMIN) || codes.has(ROLES.ADMIN) || codes.has(ROLES.OPERATOR)) {
    return '/admin';
  }
  if (codes.has(ROLES.GURU) || codes.has(ROLES.WALI_KELAS)) return '/guru';
  if (codes.has(ROLES.SISWA)) return '/siswa';
  if (codes.has(ROLES.ORANG_TUA)) return '/orangtua';
  return '/';
}
