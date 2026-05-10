'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Student {
  id: string;
  fullName: string;
  nis: string | null;
  initial: { status: string; notes: string | null };
}

const STATUS_OPTIONS = [
  { value: 'present', label: 'Hadir' },
  { value: 'sick', label: 'Sakit' },
  { value: 'permission', label: 'Izin' },
  { value: 'absent', label: 'Alpa' },
  { value: 'late', label: 'Terlambat' },
];

export function AttendanceForm({
  classId,
  date,
  students,
}: {
  classId: string;
  date: string;
  students: ReadonlyArray<Student>;
}) {
  const [marks, setMarks] = useState(Object.fromEntries(students.map((s) => [s.id, s.initial])));
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const res = await fetch('/api/guru/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId,
        date,
        marks: students.map((s) => ({
          studentId: s.id,
          status: marks[s.id]?.status ?? 'present',
          notes: marks[s.id]?.notes ?? null,
        })),
      }),
    });
    const data = (await res.json()) as { ok: boolean; count?: number; message?: string };
    if (res.ok && data.ok) {
      setMessage(`Tersimpan ${data.count ?? students.length} entri.`);
    } else {
      setMessage(data.message ?? 'Gagal menyimpan.');
    }
    setSubmitting(false);
  };

  const setAll = (status: string) => {
    setMarks((prev) =>
      Object.fromEntries(students.map((s) => [s.id, { status, notes: prev[s.id]?.notes ?? null }])),
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Hadir ({students.length} siswa)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-500">Aksi cepat:</span>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setAll(s.value)}
                className="rounded-md border border-slate-200 px-2 py-1 hover:border-brand-400 dark:border-slate-700"
              >
                Semua {s.label}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-900">
                <tr>
                  <th className="px-3 py-2">Nama</th>
                  <th className="px-3 py-2">NIS</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="px-3 py-2 font-medium">{s.fullName}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">{s.nis ?? '—'}</td>
                    <td className="px-3 py-2">
                      <select
                        value={marks[s.id]?.status ?? 'present'}
                        onChange={(e) =>
                          setMarks({
                            ...marks,
                            [s.id]: {
                              status: e.target.value,
                              notes: marks[s.id]?.notes ?? null,
                            },
                          })
                        }
                        className="h-8 rounded-md border border-slate-300 bg-white px-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        maxLength={280}
                        value={marks[s.id]?.notes ?? ''}
                        onChange={(e) =>
                          setMarks({
                            ...marks,
                            [s.id]: {
                              status: marks[s.id]?.status ?? 'present',
                              notes: e.target.value || null,
                            },
                          })
                        }
                        className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Menyimpan…' : 'Simpan Kehadiran'}
            </Button>
            {message && <span className="text-sm text-slate-500">{message}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
