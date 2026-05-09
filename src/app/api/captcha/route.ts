import { NextResponse } from 'next/server';

import { issueCaptcha } from '@/shared/security/captcha';

/** Issue a fresh captcha challenge. The token is opaque; client echoes it back at login. */
export async function GET() {
  const challenge = issueCaptcha();
  const res = NextResponse.json(challenge);
  res.headers.set('Cache-Control', 'no-store, max-age=0');
  return res;
}
