'use client';

import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { Branding } from '@/modules/branding/service';

type Status =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'ok'; message: string }
  | { kind: 'err'; message: string };

interface UploadFieldProps {
  label: string;
  description: string;
  field: 'favicon' | 'logo' | 'loginBackground';
  current: string | null;
  preview: 'icon' | 'rect' | 'wide';
  accept: string;
}

function UploadField({ label, description, field, current, preview, accept }: UploadFieldProps) {
  const [url, setUrl] = useState(current);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const fileInput = useRef<HTMLInputElement>(null);

  const onUpload = async (file: File) => {
    setStatus({ kind: 'saving' });
    try {
      const fd = new FormData();
      fd.set('field', field);
      fd.set('file', file);
      const res = await fetch('/api/admin/branding', { method: 'POST', body: fd });
      const data = (await res.json()) as { ok: boolean; url?: string; message?: string };
      if (!res.ok || !data.ok || !data.url) {
        setStatus({ kind: 'err', message: data.message ?? 'Gagal mengunggah.' });
        return;
      }
      setUrl(data.url);
      setStatus({ kind: 'ok', message: 'Tersimpan.' });
    } catch {
      setStatus({ kind: 'err', message: 'Gangguan jaringan.' });
    }
  };

  const previewSize =
    preview === 'icon' ? 'h-12 w-12' : preview === 'rect' ? 'h-16 w-32' : 'h-24 w-full';

  return (
    <div className="grid gap-3">
      <div>
        <h3 className="text-base font-semibold">{label}</h3>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className={`${previewSize} rounded border border-slate-200 bg-slate-50 object-cover dark:border-slate-700 dark:bg-slate-800`}
          />
        ) : (
          <div
            className={`${previewSize} rounded border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900`}
          />
        )}
        <input
          ref={fileInput}
          type="file"
          accept={accept}
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
          disabled={status.kind === 'saving'}
        >
          {status.kind === 'saving' ? 'Mengunggah…' : 'Unggah'}
        </Button>
        {status.kind === 'ok' && <span className="text-xs text-emerald-700">{status.message}</span>}
        {status.kind === 'err' && <span className="text-xs text-rose-700">{status.message}</span>}
      </div>
    </div>
  );
}

export function BrandingForm({ initial }: { initial: Branding }) {
  const [siteTitle, setSiteTitle] = useState(initial.siteTitle ?? '');
  const [primaryColor, setPrimaryColor] = useState(initial.primaryColor ?? '#0ea5e9');
  const [textStatus, setTextStatus] = useState<Status>({ kind: 'idle' });

  const onSaveText = async (e: React.FormEvent) => {
    e.preventDefault();
    setTextStatus({ kind: 'saving' });
    try {
      const res = await fetch('/api/admin/branding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteTitle: siteTitle || null,
          primaryColor: primaryColor || null,
        }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setTextStatus({ kind: 'err', message: data.message ?? 'Gagal menyimpan.' });
        return;
      }
      setTextStatus({ kind: 'ok', message: 'Tersimpan.' });
    } catch {
      setTextStatus({ kind: 'err', message: 'Gangguan jaringan.' });
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Identitas Visual</CardTitle>
          <CardDescription>
            Favicon dipasang ke seluruh halaman; background login terlihat saat user belum masuk.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <UploadField
            label="Favicon"
            description="PNG / ICO / SVG. Maks. 256 KB."
            field="favicon"
            current={initial.faviconUrl}
            preview="icon"
            accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml"
          />
          <UploadField
            label="Logo Sekolah"
            description="PNG / JPG / WebP / SVG. Maks. 1 MB."
            field="logo"
            current={initial.logoUrl}
            preview="rect"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
          />
          <div className="md:col-span-2">
            <UploadField
              label="Background Halaman Login"
              description="JPG / PNG / WebP. Maks. 4 MB. Tampil di balik form login."
              field="loginBackground"
              current={initial.loginBackgroundUrl}
              preview="wide"
              accept="image/jpeg,image/png,image/webp"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Judul & Warna</CardTitle>
          <CardDescription>Atur judul situs dan warna utama (primer).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSaveText} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="siteTitle">Judul Situs</Label>
              <Input
                id="siteTitle"
                maxLength={120}
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                placeholder="SIAKAD Sekolah Indonesia"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="primaryColor">Warna Utama</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer"
                />
                <Input
                  pattern="^#[0-9a-fA-F]{6}$"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </div>
            </div>
            {textStatus.kind === 'ok' && (
              <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
                {textStatus.message}
              </div>
            )}
            {textStatus.kind === 'err' && (
              <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
                {textStatus.message}
              </div>
            )}
            <div>
              <Button type="submit" disabled={textStatus.kind === 'saving'}>
                {textStatus.kind === 'saving' ? 'Menyimpan…' : 'Simpan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
