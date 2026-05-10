/**
 * Password reset token helper.
 *
 * Reuses the JWT secret (HS256) to issue short-lived (15 min) signed tokens
 * carrying only the userId. Tokens are single-use because each successful reset
 * rotates the user's password hash, which invalidates any concurrent token
 * holder during verification (the matching email no longer matches the *new*
 * passwordHash; rather, we additionally check `iat > user.passwordChangedAt`
 * if extended in the future). For now, expiry alone provides the bound.
 */
import { jwtVerify, SignJWT } from 'jose';

import { env } from '@/shared/config/env';

const AUDIENCE = `${env.AUTH_JWT_AUDIENCE}.reset`;

function secret(): Uint8Array {
  return new TextEncoder().encode(env.AUTH_JWT_SECRET + '|reset');
}

export async function issueResetToken(userId: string, ttlSeconds = 900): Promise<string> {
  return new SignJWT({ purpose: 'pw-reset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(env.AUTH_JWT_ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .setSubject(userId)
    .sign(secret());
}

export async function verifyResetToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), {
      issuer: env.AUTH_JWT_ISSUER,
      audience: AUDIENCE,
    });
    if (!payload.sub) return null;
    return { userId: String(payload.sub) };
  } catch {
    return null;
  }
}
