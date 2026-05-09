import { redirect } from 'next/navigation';

import { CbtRunner } from '@/modules/cbt/components/runner';
import { getPrincipal } from '@/modules/auth/principal';
import { PERMISSIONS } from '@/modules/rbac/permissions';
import { hasAnyPermission } from '@/modules/rbac/policy';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';

export default async function CbtPage({ params }: { params: Promise<{ examId: string }> }) {
  const principal = await getPrincipal();
  if (!principal) redirect('/login');
  if (!hasAnyPermission(principal, PERMISSIONS.EXAM_TAKE)) redirect('/');

  const { examId } = await params;
  const exam = await prisma.exam.findFirst({
    where: { id: examId, isPublished: true, deletedAt: null },
    include: {
      questions: {
        where: { deletedAt: null },
        include: { choices: true },
        orderBy: { order: 'asc' },
      },
    },
  });
  if (!exam) redirect('/siswa/ujian');

  return <CbtRunner exam={mapExam(exam)} />;
}

function mapExam(
  exam: NonNullable<Awaited<ReturnType<typeof prisma.exam.findFirst>>> & {
    questions: Array<{
      id: string;
      type: string;
      prompt: string;
      imageUrl: string | null;
      choices: Array<{ id: string; label: string; text: string }>;
    }>;
  },
) {
  return {
    id: exam.id,
    title: exam.title,
    durationMinutes: exam.durationMinutes,
    fullscreenRequired: exam.fullscreenRequired,
    preventTabSwitch: exam.preventTabSwitch,
    maxTabSwitches: exam.maxTabSwitches,
    shuffleQuestions: exam.shuffleQuestions,
    shuffleAnswers: exam.shuffleAnswers,
    questions: exam.questions.map((q) => ({
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      imageUrl: q.imageUrl ?? null,
      choices: q.choices.map((c) => ({ id: c.id, label: c.label, text: c.text })),
    })),
  };
}
