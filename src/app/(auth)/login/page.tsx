import Link from 'next/link';

import { LoginForm } from '@/modules/auth/components/login-form';
import { getBranding } from '@/modules/branding/service';

export const metadata = { title: 'Masuk' };
export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const branding = await getBranding();
  const bg = branding.loginBackgroundUrl ?? '/img/hero/login-bg.jpg';
  const logo = branding.logoUrl;
  const title = branding.siteTitle ?? 'SIAKAD';
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center px-4 py-12">
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-gradient-to-br from-brand-700 to-slate-900"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative login bg */}
      <img
        src={bg}
        alt=""
        aria-hidden
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-tr from-slate-950/85 via-slate-900/70 to-brand-900/40"
      />
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="h-10 w-10 rounded-lg bg-white object-contain p-1" />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600 text-white shadow-md">
                SK
              </span>
            )}
            {title}
          </Link>
          <p className="mt-2 text-sm text-slate-200">
            Masuk dengan akun Anda untuk mengakses dashboard SIAKAD.
          </p>
        </div>
        <LoginForm />
        <div className="mt-6 space-y-2 text-center text-xs text-slate-200/80">
          <p className="text-slate-300/70">
            Demo:{' '}
            <code className="rounded bg-black/30 px-1 py-0.5 font-mono">
              superadmin / ChangeMe!2026
            </code>
          </p>
        </div>
      </div>
    </main>
  );
}
