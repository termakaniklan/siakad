'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export function NewsManager({ initialPosts }: { initialPosts: ReadonlyArray<Post> }) {
  const [posts, setPosts] = useState<ReadonlyArray<Post>>(initialPosts);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = async () => {
    const res = await fetch('/admin/cms/berita?_partial=1', { cache: 'no-store' }).catch(
      () => null,
    );
    if (res) window.location.reload();
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/admin/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        excerpt: excerpt || null,
        content,
        coverImageUrl: coverImageUrl || null,
        isPublished,
      }),
    });
    const data = (await res.json()) as { ok: boolean; message?: string; post?: Post };
    if (!res.ok || !data.ok || !data.post) {
      setError(data.message ?? 'Gagal menyimpan.');
      return;
    }
    setPosts([
      {
        id: data.post.id,
        title: data.post.title,
        slug: data.post.slug ?? '',
        excerpt: data.post.excerpt ?? null,
        isPublished: data.post.isPublished,
        publishedAt: data.post.publishedAt ?? null,
        createdAt: data.post.createdAt ?? new Date().toISOString(),
      },
      ...posts,
    ]);
    setTitle('');
    setExcerpt('');
    setContent('');
    setCoverImageUrl('');
    setIsPublished(false);
  };

  const togglePublish = (post: Post) => {
    startTransition(async () => {
      const res = await fetch(`/api/admin/news/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !post.isPublished }),
      });
      if (!res.ok) return;
      setPosts(posts.map((p) => (p.id === post.id ? { ...p, isPublished: !post.isPublished } : p)));
    });
  };

  const onDelete = (post: Post) => {
    if (!confirm(`Hapus "${post.title}"?`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/news/${post.id}`, { method: 'DELETE' });
      if (res.ok) setPosts(posts.filter((p) => p.id !== post.id));
    });
    void refresh;
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Tulis Berita</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="news-title">Judul</Label>
              <Input
                id="news-title"
                required
                minLength={3}
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="news-excerpt">Ringkasan (opsional)</Label>
              <Input
                id="news-excerpt"
                maxLength={280}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="news-cover">Cover URL (opsional)</Label>
              <Input
                id="news-cover"
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="news-content">Konten (HTML)</Label>
              <textarea
                id="news-content"
                rows={8}
                required
                maxLength={64_000}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
                placeholder="<p>Tulis konten di sini…</p>"
              />
              <p className="text-xs text-slate-500">
                Tag berbahaya (script, style, on*) otomatis dihapus oleh sanitizer DOMPurify.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4"
              />
              Terbitkan langsung
            </label>
            {error && <p className="text-sm text-rose-700">{error}</p>}
            <div>
              <Button type="submit">Simpan Berita</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Berita ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-2">Judul</th>
                <th className="px-4 py-2">Slug</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {posts.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 font-medium">{p.title}</td>
                  <td className="px-4 py-2 font-mono text-xs text-slate-500">{p.slug}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        p.isPublished
                          ? 'rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                          : 'rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-200'
                      }
                    >
                      {p.isPublished ? 'Terbit' : 'Draf'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {new Date(p.publishedAt ?? p.createdAt).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => togglePublish(p)}
                      >
                        {p.isPublished ? 'Tarik' : 'Terbit'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => onDelete(p)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                    Belum ada berita.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
