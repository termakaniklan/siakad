import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import { env } from '@/shared/config/env';

const SECRET = () => env.AUTH_SESSION_SECRET;

/**
 * Stateless double-submit CSRF token.
 *
 * - `issueCsrfToken()` returns an HMAC-signed token tied to the current session id (or
 *   anonymous nonce). Clients echo it through a header (`X-CSRF-Token`) for state-changing
 *   requests; cookie + header equality + signature verifies the token.
 */
export function issueCsrfToken(sessionId: string): string {
  const nonce = randomBytes(16).toString('base64url');
  const payload = `${sessionId}.${nonce}`;
  const sig = createHmac('sha256', SECRET()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyCsrfToken(token: string, sessionId: string): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [tokenSession, nonce, sig] = parts as [string, string, string];
  if (tokenSession !== sessionId) return false;
  const expected = createHmac('sha256', SECRET())
    .update(`${tokenSession}.${nonce}`)
    .digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
