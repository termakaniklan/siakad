'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserRow {
  id: string;
  fullName: string;
  email: string;
  username: string;
  phone: string | null;
  isActive: boolean;
  roleCodes: string[];
  roleNames: string[];
}

interface RoleOption {
  id: string;
  code: string;
  name: string;
}

interface Props {
  canManage: boolean;
  currentUserId: string;
  roles: ReadonlyArray<RoleOption>;
  initial: ReadonlyArray<UserRow>;
}

export function UsersManager({ canManage, currentUserId, roles, initial }: Props) {
  const [users, setUsers] = useState<ReadonlyArray<UserRow>>(initial);
  const [search, setSearch] = useState('');
  const [pending, startTransition] = useTransition();

  // Create form state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [createRoles, setCreateRoles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.roleCodes.some((c) => c.toLowerCase().includes(q))
    );
  });

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        username,
        fullName,
        phone: phone || null,
        password,
        roleCodes: createRoles,
      }),
    });
    const data = (await res.json()) as { ok: boolean; message?: string; user?: { id: string } };
    if (!res.ok || !data.ok || !data.user) {
      setError(data.message ?? 'Gagal menyimpan.');
      return;
    }
    setUsers([
      {
        id: data.user.id,
        fullName,
        email,
        username,
        phone: phone || null,
        isActive: true,
        roleCodes: createRoles,
        roleNames: createRoles
          .map((c) => roles.find((r) => r.code === c)?.name ?? c)
          .filter(Boolean),
      },
      ...users,
    ]);
    setEmail('');
    setUsername('');
    setFullName('');
    setPassword('');
    setPhone('');
    setCreateRoles([]);
  };

  const toggleActive = (u: UserRow) => {
    if (!canManage) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !u.isActive }),
      });
      if (res.ok) setUsers(users.map((x) => (x.id === u.id ? { ...x, isActive: !u.isActive } : x)));
    });
  };

  const onDelete = (u: UserRow) => {
    if (u.id === currentUserId) {
      alert('Tidak dapat menghapus akun sendiri.');
      return;
    }
    if (!confirm(`Hapus pengguna "${u.fullName}"? Sesi aktif akan diakhiri.`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
      if (res.ok) setUsers(users.filter((x) => x.id !== u.id));
    });
  };

  const onRoleChange = (u: UserRow, newCodes: string[]) => {
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleCodes: newCodes }),
      });
      if (res.ok)
        setUsers(
          users.map((x) =>
            x.id === u.id
              ? {
                  ...x,
                  roleCodes: newCodes,
                  roleNames: newCodes
                    .map((c) => roles.find((r) => r.code === c)?.name ?? c)
                    .filter(Boolean),
                }
              : x,
          ),
        );
    });
  };

  return (
    <div className="grid gap-4">
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Tambah Pengguna</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onCreate} className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="cu-fullName">Nama Lengkap</Label>
                <Input
                  id="cu-fullName"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cu-email">Email</Label>
                <Input
                  id="cu-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cu-username">Username</Label>
                <Input
                  id="cu-username"
                  required
                  pattern="^[a-zA-Z0-9._-]+$"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cu-phone">Telepon</Label>
                <Input id="cu-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cu-password">Password (min. 10)</Label>
                <Input
                  id="cu-password"
                  type="password"
                  minLength={10}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Role</Label>
                <div className="flex flex-wrap gap-2">
                  {roles.map((r) => (
                    <label
                      key={r.id}
                      className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs dark:border-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={createRoles.includes(r.code)}
                        onChange={(e) => {
                          setCreateRoles(
                            e.target.checked
                              ? [...createRoles, r.code]
                              : createRoles.filter((c) => c !== r.code),
                          );
                        }}
                      />
                      {r.name}
                    </label>
                  ))}
                </div>
              </div>
              {error && <p className="text-sm text-rose-700 md:col-span-2">{error}</p>}
              <div className="md:col-span-2">
                <Button type="submit" disabled={pending}>
                  Simpan Pengguna
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Pengguna ({filtered.length}/{users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <Input
              placeholder="Cari nama, email, username, atau role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-900">
                <tr>
                  <th className="px-3 py-2">Nama</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Username</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Status</th>
                  {canManage && <th className="px-3 py-2 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="px-3 py-2 font-medium">{u.fullName}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{u.username}</td>
                    <td className="px-3 py-2">
                      {canManage ? (
                        <details>
                          <summary className="cursor-pointer text-xs">
                            {u.roleNames.join(', ') || '—'}
                          </summary>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {roles.map((r) => (
                              <label
                                key={r.id}
                                className="flex items-center gap-1 rounded border border-slate-200 px-1.5 py-0.5 text-xs dark:border-slate-700"
                              >
                                <input
                                  type="checkbox"
                                  defaultChecked={u.roleCodes.includes(r.code)}
                                  onChange={(e) => {
                                    const next = e.target.checked
                                      ? [...u.roleCodes, r.code]
                                      : u.roleCodes.filter((c) => c !== r.code);
                                    onRoleChange(u, next);
                                  }}
                                />
                                {r.code}
                              </label>
                            ))}
                          </div>
                        </details>
                      ) : (
                        u.roleNames.join(', ') || '—'
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className={u.isActive ? 'text-emerald-600' : 'text-rose-600'}>
                        {u.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={pending}
                            onClick={() => toggleActive(u)}
                          >
                            {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={pending || u.id === currentUserId}
                            onClick={() => onDelete(u)}
                          >
                            Hapus
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-6 text-center text-slate-500"
                      colSpan={canManage ? 6 : 5}
                    >
                      Tidak ada pengguna.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
