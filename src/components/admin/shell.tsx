'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme/theme-provider';

interface MenuLeaf {
  label: string;
  href: string;
}
interface MenuGroup {
  label: string;
  children: MenuLeaf[];
}

const MENU: MenuGroup[] = [
  {
    label: 'Beranda',
    children: [{ label: 'Dashboard', href: '/admin' }],
  },
  {
    label: 'Akademik',
    children: [
      { label: 'Tahun Ajaran', href: '/admin/akademik/tahun-ajaran' },
      { label: 'Kelas', href: '/admin/akademik/kelas' },
      { label: 'Mata Pelajaran', href: '/admin/akademik/mapel' },
      { label: 'Jadwal', href: '/admin/akademik/jadwal' },
      { label: 'Absensi', href: '/admin/akademik/absensi' },
      { label: 'Pelanggaran', href: '/admin/akademik/pelanggaran' },
    ],
  },
  {
    label: 'Ujian / CBT',
    children: [
      { label: 'Daftar Ujian', href: '/admin/cbt/ujian' },
      { label: 'Bank Soal', href: '/admin/cbt/bank-soal' },
      { label: 'Konfigurasi CBT', href: '/admin/cbt/konfigurasi' },
    ],
  },
  {
    label: 'PPDB',
    children: [
      { label: 'Pendaftar', href: '/admin/ppdb/pendaftar' },
      { label: 'Pengaturan PPDB', href: '/admin/ppdb/pengaturan' },
    ],
  },
  {
    label: 'CMS',
    children: [
      { label: 'Halaman', href: '/admin/cms/halaman' },
      { label: 'Berita', href: '/admin/cms/berita' },
      { label: 'Galeri', href: '/admin/cms/galeri' },
      { label: 'Pengumuman', href: '/admin/cms/pengumuman' },
      { label: 'Menu', href: '/admin/cms/menu' },
    ],
  },
  {
    label: 'Pengguna & Hak',
    children: [
      { label: 'Pengguna', href: '/admin/pengguna' },
      { label: 'Role', href: '/admin/role' },
      { label: 'Permission', href: '/admin/permission' },
    ],
  },
  {
    label: 'Sistem',
    children: [
      { label: 'Pengaturan', href: '/admin/sistem/pengaturan' },
      { label: 'SMTP', href: '/admin/sistem/smtp' },
      { label: 'WhatsApp', href: '/admin/sistem/whatsapp' },
      { label: 'Pembayaran', href: '/admin/sistem/pembayaran' },
      { label: 'Audit Log', href: '/admin/sistem/audit' },
      { label: 'Health Check', href: '/admin/sistem/health' },
    ],
  },
];

export function AdminShell({
  principal,
  children,
}: {
  principal: { userId: string; roleCodes: ReadonlyArray<string> };
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const onLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 ${
          collapsed ? '-translate-x-full md:w-16 md:translate-x-0' : 'translate-x-0'
        }`}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            href="/admin"
            className="text-base font-semibold text-brand-700 dark:text-brand-400"
          >
            {collapsed ? 'SK' : 'SIAKAD'}
          </Link>
          <button
            type="button"
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
            onClick={() => setCollapsed((v) => !v)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {MENU.map((group) => (
            <div key={group.label} className="mt-4">
              {!collapsed && (
                <p className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {group.label}
                </p>
              )}
              <ul className="mt-1">
                {group.children.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`mx-1 my-0.5 block rounded-md px-2 py-1.5 text-sm transition-colors ${
                          active
                            ? 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200'
                            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        {collapsed ? item.label.slice(0, 2) : item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div
        className={`flex flex-1 flex-col transition-[margin] ${collapsed ? 'md:ml-16' : 'md:ml-64'}`}
      >
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <p className="text-sm text-slate-500">
            Login sebagai{' '}
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {principal.roleCodes.join(', ') || 'pengguna'}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <select
              aria-label="Tema"
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
              className="h-8 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="system">Sistem</option>
              <option value="light">Terang</option>
              <option value="dark">Gelap</option>
            </select>
            <Button variant="outline" size="sm" onClick={onLogout}>
              Keluar
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
