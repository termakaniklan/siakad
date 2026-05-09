/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

import {
  ALL_PERMISSIONS,
  defaultRolePermissions,
  ROLES,
  type RoleCode,
} from '../src/modules/rbac/permissions';

const prisma = new PrismaClient();

const ROLE_DESCRIPTIONS: Record<RoleCode, { name: string; description: string }> = {
  super_admin: {
    name: 'Super Admin',
    description: 'Akses penuh, hanya boleh dimiliki oleh administrator sistem.',
  },
  admin: { name: 'Administrator', description: 'Pengelola umum sistem akademik dan CMS.' },
  operator: { name: 'Operator', description: 'Pengelola data harian (jadwal, absensi, berita).' },
  guru: { name: 'Guru', description: 'Pengajar mata pelajaran.' },
  wali_kelas: { name: 'Wali Kelas', description: 'Guru penanggung jawab kelas.' },
  siswa: { name: 'Siswa', description: 'Peserta didik.' },
  orang_tua: { name: 'Orang Tua/Wali', description: 'Pemantau perkembangan anak.' },
};

async function upsertPermissions() {
  for (const code of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code },
      update: { name: code },
      create: { code, name: code },
    });
  }
}

async function upsertRoles() {
  for (const [code, info] of Object.entries(ROLE_DESCRIPTIONS)) {
    const permCodes = defaultRolePermissions[code as RoleCode];
    const perms = await prisma.permission.findMany({ where: { code: { in: [...permCodes] } } });
    await prisma.role.upsert({
      where: { code },
      update: {
        name: info.name,
        description: info.description,
        isSystem: true,
        permissions: { set: perms.map((p) => ({ id: p.id })) },
      },
      create: {
        code,
        name: info.name,
        description: info.description,
        isSystem: true,
        permissions: { connect: perms.map((p) => ({ id: p.id })) },
      },
    });
  }
}

async function ensureSuperAdmin() {
  const email = 'admin@siakad.local';
  const username = 'superadmin';
  const password = process.env.SEED_SUPERADMIN_PASSWORD ?? 'ChangeMe!2026';
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const role = await prisma.role.findUniqueOrThrow({ where: { code: ROLES.SUPER_ADMIN } });
  await prisma.user.upsert({
    where: { email },
    update: {
      isActive: true,
      roles: { set: [{ id: role.id }] },
    },
    create: {
      email,
      username,
      passwordHash,
      fullName: 'Super Administrator',
      isActive: true,
      roles: { connect: [{ id: role.id }] },
    },
  });
}

async function seedSampleSchool() {
  await prisma.schoolProfile.upsert({
    where: { id: 'default-school' },
    update: {},
    create: {
      id: 'default-school',
      name: 'SMA Negeri Contoh',
      level: 'SMA',
      address: 'Jl. Pendidikan No. 1, Jakarta',
      phone: '+62-21-0000-0000',
      email: 'info@sekolah-contoh.sch.id',
      website: 'https://sekolah-contoh.sch.id',
      visionText: 'Mencetak generasi unggul, berkarakter, dan berdaya saing global.',
      missionText:
        'Menyelenggarakan pendidikan bermutu berbasis nilai, mengembangkan potensi peserta didik secara holistik, serta menjalin kerja sama dengan dunia industri.',
    },
  });
}

async function seedWilayahSample() {
  // Minimal sample. Replace with full BPS dataset import in production (see README §10).
  await prisma.province.upsert({
    where: { id: '31' },
    update: {},
    create: { id: '31', name: 'DKI Jakarta' },
  });
  await prisma.regency.upsert({
    where: { id: '3171' },
    update: {},
    create: { id: '3171', name: 'Jakarta Selatan', provinceId: '31' },
  });
  await prisma.district.upsert({
    where: { id: '317101' },
    update: {},
    create: { id: '317101', name: 'Kebayoran Baru', regencyId: '3171' },
  });
  await prisma.village.upsert({
    where: { id: '31710101' },
    update: {},
    create: {
      id: '31710101',
      name: 'Senayan',
      districtId: '317101',
      postalCode: '12190',
    },
  });
}

async function seedDefaultMenu() {
  const items = [
    { id: 'menu-home', label: 'Beranda', url: '/', order: 1 },
    { id: 'menu-news', label: 'Berita', url: '/berita', order: 2 },
    { id: 'menu-profile', label: 'Profil', url: '/profil', order: 3 },
    { id: 'menu-gallery', label: 'Galeri', url: '/galeri', order: 4 },
    { id: 'menu-ppdb', label: 'PPDB', url: '/ppdb', order: 5 },
    { id: 'menu-contact', label: 'Kontak', url: '/kontak', order: 6 },
  ];
  for (const item of items) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: { label: item.label, url: item.url, order: item.order },
      create: { ...item, visibility: 'public' },
    });
  }
}

async function seedSettings() {
  const baseline = [
    { key: 'site.name', value: 'SIAKAD Sekolah Indonesia', category: 'site' },
    { key: 'site.tagline', value: 'Pendidikan modern untuk generasi unggul', category: 'site' },
    { key: 'ppdb.is_open', value: false, category: 'ppdb' },
    { key: 'cbt.shuffle_default', value: true, category: 'cbt' },
  ];
  for (const s of baseline) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value, category: s.category },
      create: s,
    });
  }
}

async function main() {
  console.log('· Seeding permissions');
  await upsertPermissions();
  console.log('· Seeding roles');
  await upsertRoles();
  console.log('· Ensuring super admin user');
  await ensureSuperAdmin();
  console.log('· Seeding sample school + wilayah + menu + settings');
  await seedSampleSchool();
  await seedWilayahSample();
  await seedDefaultMenu();
  await seedSettings();
  console.log('Seeding complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
