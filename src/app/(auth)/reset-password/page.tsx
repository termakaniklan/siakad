import Link from 'next/link';

import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { getBranding } from '@/modules/branding/service';

export const metadata = { title: 'Reset Password' };
export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  const branding = await getBranding();
  const bg = branding.loginBackgroundUrl ?? '/img/hero/login-bg.jpg';
  const token = typeof searchParams?.token === 'string' ? searchParams.token : null;
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center px-4 py-12">
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-gradient-to-br from-brand-700 to-slate-900"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative bg */}
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
      <div className="w-full max-w-md text-white">
        <Link href="/login" className="text-sm text-slate-200 hover:underline">
          ← Kembali ke login
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Reset Password</h1>
        <p className="mt-1 text-sm text-slate-200">
          {token
            ? 'Masukkan password baru Anda. Setelah berhasil, semua sesi akan diakhiri.'
            : 'Masukkan email atau username terdaftar. Kami akan mengirim tautan reset password.'}
        </p>
        <ResetPasswordForm token={token} />
      </div>
    </main>
  );
}
