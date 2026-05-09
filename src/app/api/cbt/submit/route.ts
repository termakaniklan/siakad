import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getPrincipal } from '@/modules/auth/principal';
import { PERMISSIONS } from '@/modules/rbac/permissions';
import { hasAnyPermission } from '@/modules/rbac/policy';
import { prisma } from '@/shared/db/prisma';

const schema = z.object({
  examId: z.string().min(1),
  answers: z.record(
    z.string(),
    z.object({ choiceId: z.string().optional(), textAnswer: z.string().optional() }),
  ),
  tabSwitches: z.number().int().min(0),
  fullscreenExits: z.number().int().min(0),
  reason: z.enum(['manual', 'auto_time', 'auto_cheat']),
});

export async function POST(req: Request) {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ ok: false }, { status: 401 });
  if (!hasAnyPermission(principal, PERMISSIONS.EXAM_TAKE)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: 'Payload tidak valid.' }, { status: 400 });
  }

  const exam = await prisma.exam.findFirst({
    where: { id: parsed.data.examId, isPublished: true, deletedAt: null },
    include: { questions: { include: { choices: true } } },
  });
  if (!exam)
    return NextResponse.json({ ok: false, message: 'Ujian tidak ditemukan.' }, { status: 404 });

  // Auto-grade MCQ; essay flagged for manual review.
  let total = 0;
  const answersData: Array<{
    questionId: string;
    choiceId?: string;
    textAnswer?: string;
    isCorrect?: boolean;
    scoreAwarded?: number;
  }> = [];
  for (const q of exam.questions) {
    const a = parsed.data.answers[q.id];
    if (!a) continue;
    if (q.type === 'essay') {
      answersData.push({ questionId: q.id, textAnswer: a.textAnswer });
      continue;
    }
    const correct = q.choices.find((c) => c.isCorrect);
    const isCorrect = correct?.id === a.choiceId;
    const scoreAwarded = isCorrect ? q.points : 0;
    total += scoreAwarded;
    answersData.push({ questionId: q.id, choiceId: a.choiceId, isCorrect, scoreAwarded });
  }

  const status =
    parsed.data.reason === 'auto_cheat'
      ? 'flagged'
      : parsed.data.reason === 'auto_time'
        ? 'auto_submit'
        : 'submitted';

  const attempt = await prisma.examAttempt.upsert({
    where: { examId_studentId: { examId: exam.id, studentId: principal.userId } },
    update: {
      submittedAt: new Date(),
      status,
      score: total,
      tabSwitchCount: parsed.data.tabSwitches,
      fullscreenExitCount: parsed.data.fullscreenExits,
      answers: {
        deleteMany: {},
        create: answersData,
      },
    },
    create: {
      examId: exam.id,
      studentId: principal.userId,
      submittedAt: new Date(),
      status,
      score: total,
      tabSwitchCount: parsed.data.tabSwitches,
      fullscreenExitCount: parsed.data.fullscreenExits,
      answers: { create: answersData },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: principal.userId,
      action: 'cbt.submit',
      entityType: 'ExamAttempt',
      entityId: attempt.id,
      metadata: { reason: parsed.data.reason, score: total },
    },
  });

  return NextResponse.json({ ok: true, attemptId: attempt.id, score: total, status });
}
