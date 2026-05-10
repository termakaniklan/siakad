'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme/theme-provider';

import type { NavCatalogue } from '@/modules/rbac/nav';

interface ShellProps {
  catalogue: NavCatalogue;
  user: {
    fullName: string;
    avatarUrl: string | null;
    roleCodes: ReadonlyArray<string>;
  };
  children: React.ReactNode;
}

const PORTAL_ACCENTS: Record<NavCatalogue['portal'], string> = {
  siswa: 'from-emerald-500 to-emerald-700',
  orangtua: 'from-amber-500 to-amber-700',
  guru: 'from-sky-500 to-sky-700',
  admin: 'from-brand-500 to-brand-700',
};

export function PortalShell({ catalogue, user, children }: ShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const accent = PORTAL_ACCENTS[catalogue.portal];

  const onLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const initials = user.fullName
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 ${
          collapsed ? '-translate-x-full md:w-16 md:translate-x-0' : 'translate-x-0'
        }`}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            href={catalogue.groups[0]?.items[0]?.href ?? '/'}
            className={`bg-gradient-to-r ${accent} bg-clip-text text-base font-semibold text-transparent`}
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
          {catalogue.groups.map((group) => (
            <div key={group.label} className="mt-4">
              {!collapsed && (
                <p className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {group.label}
                </p>
              )}
              <ul className="mt-1">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/' && pathname?.startsWith(item.href + '/'));
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
          <div className="text-sm">
            <p className="font-medium text-slate-900 dark:text-slate-100">{catalogue.title}</p>
            {catalogue.subtitle && <p className="text-xs text-slate-500">{catalogue.subtitle}</p>}
          </div>
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
            <Link
              href="/akun/profil"
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900"
              aria-label="Profil saya"
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-xs font-semibold text-white`}
                >
                  {initials || 'U'}
                </span>
              )}
              <span className="hidden max-w-[10rem] truncate sm:block">{user.fullName}</span>
            </Link>
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
