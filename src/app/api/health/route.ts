import { NextResponse } from 'next/server';

import { prisma } from '@/shared/db/prisma';
import { redis } from '@/shared/cache/redis';

/** Liveness + readiness probe. */
export async function GET() {
  const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {};

  const t0 = Date.now();
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    checks.db = { ok: true, latencyMs: Date.now() - t0 };
  } catch (e) {
    checks.db = { ok: false, error: (e as Error).message };
  }

  const t1 = Date.now();
  try {
    if (redis.status !== 'ready') await redis.connect();
    await redis.ping();
    checks.redis = { ok: true, latencyMs: Date.now() - t1 };
  } catch (e) {
    checks.redis = { ok: false, error: (e as Error).message };
  }

  const ok = Object.values(checks).every((c) => c.ok);
  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 503 });
}
