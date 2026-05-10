'use client';

import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  user: {
    email: string;
    username: string;
    fullName: string;
    phone: string | null;
    avatarUrl: string | null;
    nis: string | null;
    nip: string | null;
    roleNames: ReadonlyArray<string>;
  };
}

type Status =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'ok'; message: string }
  | { kind: 'err'; message: string };

export function ProfilForm({ user }: Props) {
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [profileStatus, setProfileStatus] = useState<Status>({ kind: 'idle' });
  const [avatarStatus, setAvatarStatus] = useState<Status>({ kind: 'idle' });
  const fileInput = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwStatus, setPwStatus] = useState<Status>({ kind: 'idle' });

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus({ kind: 'saving' });
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setProfileStatus({ kind: 'err', message: data.message ?? 'Gagal menyimpan.' });
      } else {
        setProfileStatus({ kind: 'ok', message: 'Tersimpan.' });
      }
    } catch {
      setProfileStatus({ kind: 'err', message: 'Gangguan jaringan.' });
    }
  };

  const onUpload = async (file: File) => {
    setAvatarStatus({ kind: 'saving' });
    try {
      const fd = new FormData();
      fd.set('file', file);
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
      const data = (await res.json()) as { ok: boolean; url?: string; message?: string };
      if (!res.ok || !data.ok || !data.url) {
        setAvatarStatus({ kind: 'err', message: data.message ?? 'Gagal mengunggah.' });
        return;
      }
      setAvatarUrl(data.url);
      setAvatarStatus({ kind: 'ok', message: 'Foto profil diperbarui.' });
    } catch {
      setAvatarStatus({ kind: 'err', message: 'Gangguan jaringan.' });
    }
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwStatus({ kind: 'err', message: 'Konfirmasi password tidak sama.' });
      return;
    }
    if (newPassword.length < 10) {
      setPwStatus({ kind: 'err', message: 'Password baru minimal 10 karakter.' });
      return;
    }
    setPwStatus({ kind: 'saving' });
    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setPwStatus({ kind: 'err', message: data.message ?? 'Gagal mengubah password.' });
      } else {
        setPwStatus({ kind: 'ok', message: 'Password berhasil diubah.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPwStatus({ kind: 'err', message: 'Gangguan jaringan.' });
    }
  };

  return (
    <div className="mt-6 grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Foto Profil</CardTitle>
          <CardDescription>PNG / JPG / WebP, maks. 2 MB.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-2xl font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {user.fullName
                  .split(' ')
                  .map((p) => p[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
            )}
            <div>
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onUpload(f);
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInput.current?.click()}
                disabled={avatarStatus.kind === 'saving'}
              >
                {avatarStatus.kind === 'saving' ? 'Mengunggah…' : 'Ganti Foto'}
              </Button>
              {avatarStatus.kind === 'ok' && (
                <p className="mt-2 text-xs text-emerald-700">{avatarStatus.message}</p>
              )}
              {avatarStatus.kind === 'err' && (
                <p className="mt-2 text-xs text-rose-700">{avatarStatus.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Diri</CardTitle>
          <CardDescription>
            Email & username dikelola admin sekolah. Hubungi admin bila perlu diubah.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSaveProfile} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                required
                maxLength={120}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Telepon</Label>
              <Input
                id="phone"
                maxLength={32}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+62 8xx xxxx xxxx"
              />
            </div>
            <div className="grid gap-1.5 md:grid-cols-2 md:gap-4">
              <div>
                <Label>Email</Label>
                <Input value={user.email} disabled />
              </div>
              <div>
                <Label>Username</Label>
                <Input value={user.username} disabled />
              </div>
            </div>
            <div className="grid gap-1.5 md:grid-cols-2 md:gap-4">
              <div>
                <Label>NIS</Label>
                <Input value={user.nis ?? '—'} disabled />
              </div>
              <div>
                <Label>NIP</Label>
                <Input value={user.nip ?? '—'} disabled />
              </div>
            </div>
            <div className="text-xs text-slate-500">Role: {user.roleNames.join(', ') || '—'}</div>
            {profileStatus.kind === 'ok' && (
              <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                {profileStatus.message}
              </div>
            )}
            {profileStatus.kind === 'err' && (
              <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-200">
                {profileStatus.message}
              </div>
            )}
            <div>
              <Button type="submit" disabled={profileStatus.kind === 'saving'}>
                {profileStatus.kind === 'saving' ? 'Menyimpan…' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
          <CardDescription>
            Setelah berhasil, semua sesi lain di perangkat lain akan diakhiri.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onChangePassword} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="currentPassword">Password Lama</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5 md:grid-cols-2 md:gap-4">
              <div>
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
              <div>
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
            </div>
            {pwStatus.kind === 'ok' && (
              <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                {pwStatus.message}
              </div>
            )}
            {pwStatus.kind === 'err' && (
              <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-200">
                {pwStatus.message}
              </div>
            )}
            <div>
              <Button type="submit" disabled={pwStatus.kind === 'saving'}>
                {pwStatus.kind === 'saving' ? 'Memproses…' : 'Ubah Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
