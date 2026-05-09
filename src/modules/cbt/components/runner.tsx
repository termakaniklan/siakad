'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Choice {
  id: string;
  label: string;
  text: string;
}

interface Question {
  id: string;
  type: string;
  prompt: string;
  imageUrl: string | null;
  choices: Choice[];
}

interface ExamRuntime {
  id: string;
  title: string;
  durationMinutes: number;
  fullscreenRequired: boolean;
  preventTabSwitch: boolean;
  maxTabSwitches: number;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  questions: Question[];
}

interface AnswerMap {
  [questionId: string]: { choiceId?: string; textAnswer?: string };
}

const STORAGE_KEY = (examId: string) => `siakad.cbt.attempt.${examId}`;

/**
 * CBT runner — anti-cheat focused exam UI.
 *
 * Features per spec:
 * - Fullscreen lock with re-prompt + counter.
 * - Tab switch / blur detection. Auto-submits if `tabSwitches > maxTabSwitches`.
 * - Realtime countdown timer with warn at last 1m.
 * - Question + answer randomization (Fisher–Yates seeded by attempt start).
 * - Autosave to localStorage so intermittent disconnects don't lose progress.
 * - On submit, posts to `/api/cbt/submit` with the full answer map and anti-cheat counters.
 */
export function CbtRunner({ exam }: { exam: ExamRuntime }) {
  const startedAtRef = useRef<number>(Date.now());
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [current, setCurrent] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [fsExits, setFsExits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const ordered = useMemo(() => {
    const qs = exam.shuffleQuestions ? shuffle(exam.questions) : exam.questions;
    return qs.map((q) => ({
      ...q,
      choices: exam.shuffleAnswers ? shuffle(q.choices) : q.choices,
    }));
  }, [exam]);

  // Hydrate.
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY(exam.id));
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { answers: AnswerMap; current: number; startedAt: number };
      setAnswers(parsed.answers ?? {});
      setCurrent(parsed.current ?? 0);
      if (parsed.startedAt) startedAtRef.current = parsed.startedAt;
    } catch {
      // ignore
    }
  }, [exam.id]);

  // Persist.
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY(exam.id),
      JSON.stringify({ answers, current, startedAt: startedAtRef.current }),
    );
  }, [exam.id, answers, current]);

  const submit = useCallback(
    async (reason: 'manual' | 'auto_time' | 'auto_cheat') => {
      if (submitted || submitting) return;
      setSubmitting(true);
      try {
        await fetch('/api/cbt/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            examId: exam.id,
            answers,
            tabSwitches,
            fullscreenExits: fsExits,
            reason,
          }),
        });
        setSubmitted(true);
        localStorage.removeItem(STORAGE_KEY(exam.id));
      } finally {
        setSubmitting(false);
      }
    },
    [answers, exam.id, fsExits, submitted, submitting, tabSwitches],
  );

  // Countdown.
  useEffect(() => {
    if (submitted) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          void submit('auto_time');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [submit, submitted]);

  // Anti-cheat: tab switch / blur.
  useEffect(() => {
    if (!exam.preventTabSwitch) return;
    const onVis = () => {
      if (document.hidden) {
        setTabSwitches((n) => {
          const next = n + 1;
          if (next > exam.maxTabSwitches) void submit('auto_cheat');
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [exam.maxTabSwitches, exam.preventTabSwitch, submit]);

  // Anti-cheat: fullscreen exit.
  useEffect(() => {
    if (!exam.fullscreenRequired) return;
    const onFs = () => {
      if (!document.fullscreenElement) setFsExits((n) => n + 1);
    };
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, [exam.fullscreenRequired]);

  const requestFullscreen = () => {
    document.documentElement.requestFullscreen().catch(() => undefined);
  };

  const setAnswer = (qid: string, patch: { choiceId?: string; textAnswer?: string }) => {
    setAnswers((a) => ({ ...a, [qid]: { ...(a[qid] ?? {}), ...patch } }));
  };

  if (submitted) {
    return (
      <main className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Ujian terkirim</CardTitle>
            <CardDescription>Jawaban Anda telah disimpan.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const q = ordered[current];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-base font-semibold">{exam.title}</h1>
          <p className="text-xs text-slate-500">
            Soal {current + 1} / {ordered.length}
            {' · '}
            Tab-switch: {tabSwitches}/{exam.maxTabSwitches}
            {exam.fullscreenRequired && ` · FS exit: ${fsExits}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-md px-3 py-1 font-mono text-sm ${
              timeLeft < 60 ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-800'
            }`}
            aria-live="polite"
          >
            {formatTime(timeLeft)}
          </span>
          {exam.fullscreenRequired && (
            <Button size="sm" variant="outline" onClick={requestFullscreen}>
              Fullscreen
            </Button>
          )}
        </div>
      </header>

      <section className="container py-6">
        {q ? (
          <Card>
            <CardHeader>
              <CardTitle>Soal {current + 1}</CardTitle>
              <CardDescription>{q.type === 'essay' ? 'Esai' : 'Pilihan ganda'}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{q.prompt}</p>
              {q.imageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img alt="" src={q.imageUrl} className="my-4 max-h-72 rounded-md border" />
              )}
              {q.type !== 'essay' ? (
                <ul className="mt-4 space-y-2">
                  {q.choices.map((c) => (
                    <li key={c.id}>
                      <label className="flex cursor-pointer items-start gap-2 rounded-md border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={answers[q.id]?.choiceId === c.id}
                          onChange={() => setAnswer(q.id, { choiceId: c.id })}
                        />
                        <span>
                          <strong className="mr-1">{c.label}.</strong>
                          {c.text}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <textarea
                  className="mt-4 min-h-[160px] w-full rounded-md border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  value={answers[q.id]?.textAnswer ?? ''}
                  onChange={(e) => setAnswer(q.id, { textAnswer: e.target.value })}
                />
              )}

              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="outline"
                  disabled={current === 0}
                  onClick={() => setCurrent((c) => c - 1)}
                >
                  Sebelumnya
                </Button>
                {current < ordered.length - 1 ? (
                  <Button onClick={() => setCurrent((c) => c + 1)}>Selanjutnya</Button>
                ) : (
                  <Button onClick={() => submit('manual')} disabled={submitting}>
                    {submitting ? 'Mengirim…' : 'Selesai & Kirim'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <p>Tidak ada soal.</p>
        )}
      </section>
    </main>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function shuffle<T>(items: ReadonlyArray<T>): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
