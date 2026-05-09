import { NextResponse } from 'next/server';

import { authenticate, loginSchema } from '@/modules/auth/login-service';
import { logger } from '@/shared/logger';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Payload tidak valid.' }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? 'Validasi gagal.' },
      { status: 400 },
    );
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0';
  const userAgent = req.headers.get('user-agent') ?? 'unknown';
  try {
    const result = await authenticate(parsed.data, { ip, userAgent });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.error },
        { status: result.rateLimited ? 429 : 401 },
      );
    }
    return NextResponse.json({ ok: true, redirect: '/admin' });
  } catch (err) {
    logger.error({ err }, 'login.error');
    return NextResponse.json({ ok: false, message: 'Terjadi kesalahan.' }, { status: 500 });
  }
}
