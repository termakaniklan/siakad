import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { Providers } from '@/app/providers';
import { getBranding } from '@/modules/branding/service';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBranding();
  const fav = branding.faviconUrl;
  const title =
    branding.siteTitle && branding.siteTitle.length > 0
      ? branding.siteTitle
      : 'SIAKAD — Sistem Informasi Akademik';
  return {
    title: {
      default: title,
      template: `%s · ${branding.siteTitle ?? 'SIAKAD'}`,
    },
    description:
      'Sistem Informasi Akademik Sekolah Indonesia berbasis Progressive Web App. Mendukung CMS, RBAC, PPDB, CBT, dan integrasi notifikasi.',
    applicationName: branding.siteTitle ?? 'SIAKAD',
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      title: branding.siteTitle ?? 'SIAKAD',
      statusBarStyle: 'default',
    },
    icons: {
      icon: fav
        ? [{ url: fav }]
        : [
            { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
      apple: [{ url: fav ?? '/icons/icon-192.png' }],
    },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1a52e6' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} bg-slate-50 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
