'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WilayahOption {
  id: string;
  name: string;
}

interface PpdbWizardProps {
  provinces: WilayahOption[];
}

interface Draft {
  step: number;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  nisn: string;
  studentAddress: string;
  fatherName: string;
  motherName: string;
  guardianName: string;
  parentAddress: string;
  provinceId: string;
  regencyId: string;
  districtId: string;
  villageId: string;
  postalCode: string;
  contactEmail: string;
  contactPhone: string;
}

const EMPTY: Draft = {
  step: 0,
  fullName: '',
  birthPlace: '',
  birthDate: '',
  nisn: '',
  studentAddress: '',
  fatherName: '',
  motherName: '',
  guardianName: '',
  parentAddress: '',
  provinceId: '',
  regencyId: '',
  districtId: '',
  villageId: '',
  postalCode: '',
  contactEmail: '',
  contactPhone: '',
};

const STORAGE_KEY = 'siakad.ppdb.draft.v1';

const STEPS = ['Identitas', 'Orang Tua', 'Alamat', 'Kontak', 'Konfirmasi'] as const;

/**
 * PPDB multi-step wizard.
 *
 * - Persists draft to localStorage on every change (debounced 250ms).
 * - Loads cascading wilayah dropdowns from /api/wilayah/* endpoints.
 * - On final step the form POSTs to `/api/ppdb/submit` (handler validates + persists).
 */
export function PpdbWizard({ provinces }: PpdbWizardProps) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [regencies, setRegencies] = useState<WilayahOption[]>([]);
  const [districts, setDistricts] = useState<WilayahOption[]>([]);
  const [villages, setVillages] = useState<WilayahOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  // Hydrate draft.
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      setDraft({ ...EMPTY, ...(JSON.parse(raw) as Partial<Draft>) });
    } catch {
      // ignore
    }
  }, []);

  // Autosave.
  useEffect(() => {
    const id = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }, 250);
    return () => clearTimeout(id);
  }, [draft]);

  // Cascading dropdowns.
  useEffect(() => {
    if (!draft.provinceId) {
      setRegencies([]);
      return;
    }
    fetch(`/api/wilayah/regencies?provinceId=${encodeURIComponent(draft.provinceId)}`)
      .then((r) => r.json())
      .then((d) => setRegencies(d.items ?? []))
      .catch(() => setRegencies([]));
  }, [draft.provinceId]);

  useEffect(() => {
    if (!draft.regencyId) {
      setDistricts([]);
      return;
    }
    fetch(`/api/wilayah/districts?regencyId=${encodeURIComponent(draft.regencyId)}`)
      .then((r) => r.json())
      .then((d) => setDistricts(d.items ?? []))
      .catch(() => setDistricts([]));
  }, [draft.regencyId]);

  useEffect(() => {
    if (!draft.districtId) {
      setVillages([]);
      return;
    }
    fetch(`/api/wilayah/villages?districtId=${encodeURIComponent(draft.districtId)}`)
      .then((r) => r.json())
      .then((d) => setVillages(d.items ?? []))
      .catch(() => setVillages([]));
  }, [draft.districtId]);

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const next = () => set({ step: Math.min(draft.step + 1, STEPS.length - 1) });
  const back = () => set({ step: Math.max(draft.step - 1, 0) });

  const errors = useMemo(() => validate(draft), [draft]);

  const submit = async () => {
    setSubmitting(true);
    setSubmitMessage(null);
    try {
      const res = await fetch('/api/ppdb/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = (await res.json()) as { ok: boolean; message?: string; numericId?: number };
      if (!res.ok || !data.ok) {
        setSubmitMessage(data.message ?? 'Gagal mengirim pendaftaran.');
      } else {
        setSubmitMessage(`Pendaftaran terkirim. Nomor pendaftaran: ${data.numericId ?? '-'}`);
        localStorage.removeItem(STORAGE_KEY);
        setDraft(EMPTY);
      }
    } catch {
      setSubmitMessage('Terjadi kesalahan jaringan. Silakan ulangi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Langkah {draft.step + 1} / {STEPS.length}: {STEPS[draft.step]}
        </CardTitle>
        <CardDescription>Isi data dengan benar; draft akan tersimpan otomatis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {draft.step === 0 && (
          <div className="grid gap-4">
            <Field label="Nama Lengkap" required>
              <Input value={draft.fullName} onChange={(e) => set({ fullName: e.target.value })} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tempat Lahir" required>
                <Input
                  value={draft.birthPlace}
                  onChange={(e) => set({ birthPlace: e.target.value })}
                />
              </Field>
              <Field label="Tanggal Lahir" required>
                <Input
                  type="date"
                  value={draft.birthDate}
                  onChange={(e) => set({ birthDate: e.target.value })}
                />
              </Field>
            </div>
            <Field label="NISN (opsional)">
              <Input value={draft.nisn} onChange={(e) => set({ nisn: e.target.value })} />
            </Field>
            <Field label="Alamat Calon Siswa" required>
              <textarea
                className="min-h-[80px] w-full rounded-md border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={draft.studentAddress}
                onChange={(e) => set({ studentAddress: e.target.value })}
              />
            </Field>
          </div>
        )}

        {draft.step === 1 && (
          <div className="grid gap-4">
            <Field label="Nama Ayah" required>
              <Input
                value={draft.fatherName}
                onChange={(e) => set({ fatherName: e.target.value })}
              />
            </Field>
            <Field label="Nama Ibu" required>
              <Input
                value={draft.motherName}
                onChange={(e) => set({ motherName: e.target.value })}
              />
            </Field>
            <Field label="Nama Wali (opsional)">
              <Input
                value={draft.guardianName}
                onChange={(e) => set({ guardianName: e.target.value })}
              />
            </Field>
            <Field label="Alamat Orang Tua" required>
              <textarea
                className="min-h-[80px] w-full rounded-md border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={draft.parentAddress}
                onChange={(e) => set({ parentAddress: e.target.value })}
              />
            </Field>
          </div>
        )}

        {draft.step === 2 && (
          <div className="grid gap-4">
            <Field label="Provinsi" required>
              <Select
                value={draft.provinceId}
                onChange={(v) =>
                  set({ provinceId: v, regencyId: '', districtId: '', villageId: '' })
                }
                options={provinces}
              />
            </Field>
            <Field label="Kabupaten/Kota" required>
              <Select
                value={draft.regencyId}
                onChange={(v) => set({ regencyId: v, districtId: '', villageId: '' })}
                options={regencies}
                disabled={!draft.provinceId}
              />
            </Field>
            <Field label="Kecamatan" required>
              <Select
                value={draft.districtId}
                onChange={(v) => set({ districtId: v, villageId: '' })}
                options={districts}
                disabled={!draft.regencyId}
              />
            </Field>
            <Field label="Kelurahan/Desa" required>
              <Select
                value={draft.villageId}
                onChange={(v) => set({ villageId: v })}
                options={villages}
                disabled={!draft.districtId}
              />
            </Field>
            <Field label="Kode Pos">
              <Input
                value={draft.postalCode}
                onChange={(e) => set({ postalCode: e.target.value })}
                inputMode="numeric"
                pattern="[0-9]{5}"
              />
            </Field>
          </div>
        )}

        {draft.step === 3 && (
          <div className="grid gap-4">
            <Field label="Email">
              <Input
                type="email"
                value={draft.contactEmail}
                onChange={(e) => set({ contactEmail: e.target.value })}
              />
            </Field>
            <Field label="Nomor Telepon/HP">
              <Input
                value={draft.contactPhone}
                onChange={(e) => set({ contactPhone: e.target.value })}
              />
            </Field>
          </div>
        )}

        {draft.step === 4 && (
          <div className="space-y-3 text-sm">
            <p>Pastikan data sudah benar. Setelah dikirim, Anda akan menerima nomor pendaftaran.</p>
            <ul className="grid gap-1 rounded-md bg-slate-50 p-4 dark:bg-slate-900">
              <li>
                <strong>Nama:</strong> {draft.fullName}
              </li>
              <li>
                <strong>TTL:</strong> {draft.birthPlace}, {draft.birthDate}
              </li>
              <li>
                <strong>Ayah:</strong> {draft.fatherName}
              </li>
              <li>
                <strong>Ibu:</strong> {draft.motherName}
              </li>
              <li>
                <strong>Wilayah:</strong> {draft.provinceId} / {draft.regencyId} /{' '}
                {draft.districtId} / {draft.villageId}
              </li>
              <li>
                <strong>Kontak:</strong> {draft.contactEmail} · {draft.contactPhone}
              </li>
            </ul>
            {errors.length > 0 && (
              <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
                <p className="font-semibold">Periksa kembali:</p>
                <ul className="list-disc pl-5">
                  {errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            {submitMessage && <p className="text-sm">{submitMessage}</p>}
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={draft.step === 0 || submitting}
            onClick={back}
          >
            Kembali
          </Button>
          {draft.step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>
              Lanjut
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={submitting || errors.length > 0}>
              {submitting ? 'Mengirim…' : 'Kirim Pendaftaran'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>
        {label} {required && <span className="text-red-600">*</span>}
      </Label>
      {children}
    </div>
  );
}

interface SelectProps {
  value: string;
  onChange: (next: string) => void;
  options: WilayahOption[];
  disabled?: boolean;
}

function Select({ value, onChange, options, disabled }: SelectProps) {
  return (
    <select
      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">— pilih —</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );
}

function validate(d: Draft): string[] {
  const errs: string[] = [];
  if (!d.fullName.trim()) errs.push('Nama lengkap wajib diisi.');
  if (!d.birthPlace.trim()) errs.push('Tempat lahir wajib diisi.');
  if (!d.birthDate) errs.push('Tanggal lahir wajib diisi.');
  if (!d.studentAddress.trim()) errs.push('Alamat calon siswa wajib diisi.');
  if (!d.fatherName.trim()) errs.push('Nama ayah wajib diisi.');
  if (!d.motherName.trim()) errs.push('Nama ibu wajib diisi.');
  if (!d.parentAddress.trim()) errs.push('Alamat orang tua wajib diisi.');
  if (!d.provinceId || !d.regencyId || !d.districtId || !d.villageId) {
    errs.push('Wilayah belum lengkap.');
  }
  return errs;
}
