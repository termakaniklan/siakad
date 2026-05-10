'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CaptchaState {
  token: string;
  display: string;
  kind: 'alphanumeric' | 'math';
}

export function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaState | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refreshCaptcha = async () => {
    setCaptchaAnswer('');
    try {
      const res = await fetch('/api/captcha', { cache: 'no-store' });
      if (!res.ok) throw new Error('captcha-fetch-failed');
      const data = (await res.json()) as CaptchaState;
      setCaptcha(data);
    } catch {
      setCaptcha(null);
    }
  };

  useEffect(() => {
    void refreshCaptcha();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captcha) {
      setError('Captcha belum siap. Muat ulang.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password,
          rememberMe,
          captchaToken: captcha.token,
          captchaAnswer,
        }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string; redirect?: string };
      if (!res.ok || !data.ok) {
        setError(data.message ?? 'Gagal masuk.');
        await refreshCaptcha();
        return;
      }
      window.location.href = data.redirect ?? '/admin';
    } catch {
      setError('Gangguan jaringan. Coba lagi.');
      await refreshCaptcha();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Gunakan username/email dan password Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={submit} autoComplete="on">
          <div className="grid gap-1.5">
            <Label htmlFor="identifier">Username atau Email</Label>
            <Input
              id="identifier"
              autoComplete="username"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="captcha">
              Captcha {captcha?.kind === 'math' ? '(matematika)' : '(huruf-angka)'}
            </Label>
            <div className="flex items-center gap-2">
              <code
                className="select-none rounded-md border border-slate-300 bg-slate-100 px-3 py-2 font-mono text-base tracking-widest dark:border-slate-700 dark:bg-slate-800"
                aria-live="polite"
              >
                {captcha?.display ?? '· · · · · · · · · ·'}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={refreshCaptcha}
                aria-label="Acak captcha"
              >
                ↻
              </Button>
            </div>
            <Input
              id="captcha"
              required
              autoComplete="off"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              placeholder="Ketik ulang captcha"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Ingat saya di perangkat ini
          </label>
          {error && (
            <div
              className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200"
              role="alert"
            >
              {error}
            </div>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Memproses…' : 'Masuk'}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <Link
              href="/reset-password"
              className="text-brand-700 hover:underline dark:text-brand-300"
            >
              Lupa password?
            </Link>
            <Link href="/ppdb" className="text-slate-500 hover:underline dark:text-slate-400">
              Daftar PPDB →
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
