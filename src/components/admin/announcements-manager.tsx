'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: string;
  publishedAt: string | null;
  expiresAt: string | null;
  isPinned: boolean;
}

const AUDIENCES = [
  { value: 'all', label: 'Semua' },
  { value: 'role:siswa', label: 'Siswa' },
  { value: 'role:guru', label: 'Guru' },
  { value: 'role:orang_tua', label: 'Orang Tua' },
  { value: 'role:wali_kelas', label: 'Wali Kelas' },
];

export function AnnouncementsManager({ initial }: { initial: ReadonlyArray<Announcement> }) {
  const [items, setItems] = useState<ReadonlyArray<Announcement>>(initial);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [isPinned, setIsPinned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, audience, isPinned }),
    });
    const data = (await res.json()) as {
      ok: boolean;
      message?: string;
      announcement?: Announcement;
    };
    if (!res.ok || !data.ok || !data.announcement) {
      setError(data.message ?? 'Gagal menyimpan.');
      return;
    }
    setItems([data.announcement, ...items]);
    setTitle('');
    setBody('');
    setAudience('all');
    setIsPinned(false);
  };

  const onTogglePin = (a: Announcement) => {
    startTransition(async () => {
      await fetch(`/api/admin/announcements/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !a.isPinned }),
      });
      setItems(items.map((x) => (x.id === a.id ? { ...x, isPinned: !x.isPinned } : x)));
    });
  };

  const onDelete = (a: Announcement) => {
    if (!confirm(`Hapus pengumuman "${a.title}"?`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/announcements/${a.id}`, { method: 'DELETE' });
      if (res.ok) setItems(items.filter((x) => x.id !== a.id));
    });
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Buat Pengumuman</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ann-title">Judul</Label>
              <Input
                id="ann-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ann-body">Isi</Label>
              <textarea
                id="ann-body"
                rows={5}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div className="grid gap-1.5 md:grid-cols-2 md:gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="ann-audience">Audiens</Label>
                <select
                  id="ann-audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  {AUDIENCES.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-end gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="h-4 w-4"
                />
                Pinned (tampil di atas)
              </label>
            </div>
            {error && <p className="text-sm text-rose-700">{error}</p>}
            <div>
              <Button type="submit">Terbitkan</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengumuman ({items.length})</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {items.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    {a.isPinned && (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-100">
                        📌 Pinned
                      </span>
                    )}
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {a.audience}
                    </span>
                  </div>
                  <h3 className="mt-1 text-base font-semibold">{a.title}</h3>
                  <p className="text-xs text-slate-500">
                    {a.publishedAt ? new Date(a.publishedAt).toLocaleString('id-ID') : '—'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => onTogglePin(a)}
                  >
                    {a.isPinned ? 'Lepas Pin' : 'Pin'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => onDelete(a)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
              <div
                className="prose prose-sm dark:prose-invert mt-2 max-w-none text-slate-700 dark:text-slate-300"
                // eslint-disable-next-line react/no-danger -- body sanitized server-side
                dangerouslySetInnerHTML={{ __html: a.body }}
              />
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-slate-500">Belum ada pengumuman.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
