'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  token: string | null;
}

export function ResetPasswordForm({ token }: Props) {
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<'request' | 'confirm' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      setDone('request');
    } finally {
      setSubmitting(false);
    }
  };

  const onConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak sama.');
      return;
    }
    if (newPassword.length < 10) {
      setError('Password baru minimal 10 karakter.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setError(data.message ?? 'Gagal mengubah password.');
      } else {
        setDone('confirm');
      }
    } catch {
      setError('Gangguan jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done === 'request') {
    return (
      <Card className="mt-6">
        <CardContent className="space-y-3 pt-6 text-sm">
          <p>
            Jika akun terdaftar, kami telah mengirim tautan reset password ke email Anda. Cek inbox
            dan folder spam.
          </p>
          <p className="text-xs text-slate-500">
            Tautan berlaku 15 menit. Untuk demo, periksa log SMTP server Anda.
          </p>
          <Link href="/login" className="text-brand-700 hover:underline">
            Kembali ke login
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (done === 'confirm') {
    return (
      <Card className="mt-6">
        <CardContent className="space-y-3 pt-6 text-sm">
          <p>Password berhasil diubah. Silakan masuk dengan password baru Anda.</p>
          <Link
            href="/login"
            className="inline-flex rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
          >
            Masuk Sekarang
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <form onSubmit={onRequest} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="identifier">Username atau Email</Label>
              <Input
                id="identifier"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
              />
            </div>
            {error && <p className="text-sm text-rose-700">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Mengirim…' : 'Kirim Tautan Reset'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <form onSubmit={onConfirm} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="newPassword">Password Baru</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={10}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={10}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-rose-700">{error}</p>}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Memproses…' : 'Atur Ulang Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
