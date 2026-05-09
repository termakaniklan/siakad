import { jwtVerify, SignJWT } from 'jose';

import { env } from '@/shared/config/env';

/**
 * Hybrid JWT helper.
 *
 * Tokens are short-lived (~5 minutes) and used by the API surface for stateless calls,
 * while the iron-session cookie carries the long-lived session reference. Both flows
 * resolve to the same `Principal`.
 */
export interface AccessTokenClaims {
  sub: string;
  sid: string; // session id
  rls: ReadonlyArray<string>; // role codes
}

const ALG = 'HS256';

function secret(): Uint8Array {
  return new TextEncoder().encode(env.AUTH_JWT_SECRET);
}

export async function signAccessToken(
  claims: AccessTokenClaims,
  ttlSeconds = 300,
): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: ALG })
    .setIssuer(env.AUTH_JWT_ISSUER)
    .setAudience(env.AUTH_JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .setSubject(claims.sub)
    .sign(secret());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenClaims> {
  const { payload } = await jwtVerify(token, secret(), {
    issuer: env.AUTH_JWT_ISSUER,
    audience: env.AUTH_JWT_AUDIENCE,
  });
  return {
    sub: String(payload.sub ?? ''),
    sid: String((payload as { sid?: string }).sid ?? ''),
    rls: Array.isArray((payload as { rls?: unknown }).rls)
      ? ((payload as { rls: string[] }).rls as ReadonlyArray<string>)
      : [],
  };
}
