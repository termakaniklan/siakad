import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

import { env } from '@/shared/config/env';

export type CaptchaKind = 'alphanumeric' | 'math';

export interface CaptchaChallenge {
  /** Opaque token. Sent back from the client unmodified. */
  token: string;
  /** Display value: alphanumeric string OR a math expression like "3 + 4 = ?". */
  display: string;
  /** Kind of challenge (used for rendering). */
  kind: CaptchaKind;
  /** Expiration epoch seconds. */
  expiresAt: number;
}

const ALPHANUM = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

function pickAlphanum(length: number): string {
  // Ensure at least one upper + one lower + one digit for "kombinasi" requirement.
  const buckets = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghjkmnpqrstuvwxyz', '23456789'];
  const out: string[] = [];
  for (const bucket of buckets) {
    out.push(bucket[randomInt(bucket.length)]!);
  }
  while (out.length < length) {
    out.push(ALPHANUM[randomInt(ALPHANUM.length)]!);
  }
  // Fisher–Yates shuffle.
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out.join('');
}

interface MathChallenge {
  display: string;
  answer: string;
}

function makeMathChallenge(): MathChallenge {
  // Mix simple + and -. Per spec math captcha must "frequently appear" — we choose
  // it 60% of the time when called from `issueCaptcha`.
  const a = randomInt(2, 12);
  const b = randomInt(1, 9);
  const op = randomInt(2) === 0 ? '+' : '-';
  const ans = op === '+' ? a + b : a - b;
  return { display: `${a} ${op} ${b} = ?`, answer: String(ans) };
}

function sign(payload: string): string {
  return createHmac('sha256', env.CAPTCHA_HMAC_SECRET).update(payload).digest('base64url');
}

function verifySig(payload: string, sig: string): boolean {
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Issue a captcha challenge. The "math" kind is favored to satisfy "wajib sering muncul". */
export function issueCaptcha(opts?: {
  kind?: CaptchaKind;
  alphanumLength?: number;
}): CaptchaChallenge {
  const kind: CaptchaKind = opts?.kind ?? (randomInt(10) < 6 ? 'math' : 'alphanumeric');
  const expiresAt = Math.floor(Date.now() / 1000) + env.CAPTCHA_TTL_SECONDS;
  const nonce = randomBytes(8).toString('base64url');
  let display: string;
  let answer: string;
  if (kind === 'math') {
    const m = makeMathChallenge();
    display = m.display;
    answer = m.answer;
  } else {
    display = pickAlphanum(opts?.alphanumLength ?? 10);
    answer = display;
  }
  // Token format: base64url(JSON({k,a,e,n})) + "." + sig
  const payload = Buffer.from(
    JSON.stringify({ k: kind, a: answer.toLowerCase(), e: expiresAt, n: nonce }),
  ).toString('base64url');
  const token = `${payload}.${sign(payload)}`;
  return { token, display, kind, expiresAt };
}

export interface CaptchaVerifyInput {
  token: string;
  answer: string;
}

export function verifyCaptcha({ token, answer }: CaptchaVerifyInput): boolean {
  if (!token || !answer) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts as [string, string];
  if (!verifySig(payload, sig)) return false;
  let parsed: { k: CaptchaKind; a: string; e: number; n: string };
  try {
    parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return false;
  }
  if (parsed.e < Math.floor(Date.now() / 1000)) return false;
  return parsed.a === answer.trim().toLowerCase();
}
