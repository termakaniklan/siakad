import { describe, expect, it, beforeAll } from 'vitest';

beforeAll(() => {
  const env = process.env as Record<string, string | undefined>;
  env.NODE_ENV ??= 'test';
  env.APP_URL ??= 'http://localhost:3000';
  env.DATABASE_URL ??= 'mysql://siakad:siakad@localhost:3306/siakad';
  env.REDIS_URL ??= 'redis://localhost:6379/0';
  env.AUTH_SESSION_SECRET ??= 'a'.repeat(48);
  env.AUTH_JWT_SECRET ??= 'b'.repeat(48);
});

describe('captcha', () => {
  it('issues and verifies math challenges', async () => {
    const { issueCaptcha, verifyCaptcha } = await import('@/shared/security/captcha');
    const challenge = issueCaptcha({ kind: 'math' });
    expect(challenge.token.length).toBeGreaterThan(0);
    expect(challenge.kind).toBe('math');
    // Math challenge format is e.g. "12 + 5 = ?". Compute the answer ourselves.
    const m = challenge.display.match(/(\d+)\s*([+\-*])\s*(\d+)/);
    expect(m).toBeTruthy();
    const a = Number(m![1]);
    const b = Number(m![3]);
    const op = m![2];
    const ans = (op === '+' ? a + b : op === '-' ? a - b : a * b).toString();
    expect(verifyCaptcha({ token: challenge.token, answer: ans })).toBe(true);
    expect(verifyCaptcha({ token: challenge.token, answer: '99999' })).toBe(false);
  });

  it('issues alphanumeric challenges of requested length', async () => {
    const { issueCaptcha, verifyCaptcha } = await import('@/shared/security/captcha');
    const challenge = issueCaptcha({ kind: 'alphanumeric', alphanumLength: 10 });
    expect(challenge.display).toHaveLength(10);
    expect(verifyCaptcha({ token: challenge.token, answer: challenge.display })).toBe(true);
    // Case-insensitive
    expect(verifyCaptcha({ token: challenge.token, answer: challenge.display.toUpperCase() })).toBe(
      true,
    );
  });
});
