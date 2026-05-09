import { createHmac, timingSafeEqual } from 'node:crypto';

import { env } from '@/shared/config/env';

/**
 * Time-limited signed URL helper for restricted file access.
 *
 * Use case: serving uploaded files behind authentication while still allowing fast,
 * short-lived public download URLs for previews.
 */
export interface SignOptions {
  path: string; // canonical resource path, e.g. "/uploads/2025/01/foo.png"
  expiresInSeconds: number;
  scope?: string; // logical scope (e.g. user id) bound into the signature
}

export function signResourceUrl(opts: SignOptions): string {
  const expires = Math.floor(Date.now() / 1000) + opts.expiresInSeconds;
  const payload = `${opts.path}?exp=${expires}${opts.scope ? `&scope=${encodeURIComponent(opts.scope)}` : ''}`;
  const sig = createHmac('sha256', env.AUTH_SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}${payload.includes('?') ? '&' : '?'}sig=${sig}`;
}

export function verifyResourceUrl(url: string, expectedScope?: string): boolean {
  const u = new URL(url, env.APP_URL);
  const sig = u.searchParams.get('sig');
  const exp = Number(u.searchParams.get('exp'));
  if (!sig || !exp || Number.isNaN(exp)) return false;
  if (exp < Math.floor(Date.now() / 1000)) return false;
  if (expectedScope && u.searchParams.get('scope') !== expectedScope) return false;
  u.searchParams.delete('sig');
  const payload = `${u.pathname}?${u.searchParams.toString()}`;
  const expected = createHmac('sha256', env.AUTH_SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
