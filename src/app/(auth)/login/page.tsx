import Link from 'next/link';

import { LoginForm } from '@/modules/auth/components/login-form';

export const metadata = { title: 'Masuk' };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl font-bold text-brand-700 dark:text-brand-400">
            SIAKAD
          </Link>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Masuk dengan akun yang terdaftar.
          </p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Lupa password? Hubungi administrator sekolah.
        </p>
      </div>
    </main>
  );
}
