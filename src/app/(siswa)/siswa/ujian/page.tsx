import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

export default async function SiswaUjianPage() {
  const now = new Date();
  const exams = await prisma.exam
    .findMany({
      where: { isPublished: true, deletedAt: null, endAt: { gte: now } },
      include: { subject: true },
      orderBy: { startAt: 'asc' },
      take: 12,
    })
    .catch(() => []);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Ujian (CBT) Aktif & Terjadwal</CardTitle>
          <CardDescription>
            Pastikan jaringan stabil. Mode CBT akan mengaktifkan fullscreen dan deteksi tab-switch.
          </CardDescription>
        </CardHeader>
      </Card>

      {exams.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-slate-500">
            Tidak ada ujian aktif saat ini.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {exams.map((e) => {
          const start = new Date(e.startAt);
          const end = new Date(e.endAt);
          const live = start <= now && now <= end;
          return (
            <Card key={e.id} className="border-slate-200">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{e.title}</CardTitle>
                    <CardDescription>
                      {e.subject.name} · {e.durationMinutes} menit
                    </CardDescription>
                  </div>
                  <span
                    className={
                      live
                        ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                        : 'rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                    }
                  >
                    {live ? 'BERLANGSUNG' : 'TERJADWAL'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-slate-500">Mulai</dt>
                    <dd className="font-mono">
                      {start.toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Berakhir</dt>
                    <dd className="font-mono">
                      {end.toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Fullscreen</dt>
                    <dd>{e.fullscreenRequired ? 'Wajib' : 'Tidak wajib'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Tab-switch limit</dt>
                    <dd>{e.maxTabSwitches}×</dd>
                  </div>
                </dl>
                <div className="flex items-center gap-2">
                  <Link href={`/cbt/${e.id}`}>
                    <Button size="sm" disabled={!live}>
                      {live ? 'Mulai Ujian' : 'Belum Mulai'}
                    </Button>
                  </Link>
                  {e.shuffleQuestions && (
                    <span className="text-xs text-slate-500">Soal diacak</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
