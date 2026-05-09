import { getIronSession, type IronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

import { env } from '@/shared/config/env';

export interface SessionData {
  userId?: string;
  sessionId?: string;
  roleCodes?: ReadonlyArray<string>;
  permissionCodes?: ReadonlyArray<string>;
  csrfTokenSeed?: string;
  rememberMe?: boolean;
  createdAt?: number;
  lastSeenAt?: number;
  ip?: string;
  userAgent?: string;
}

export function sessionOptions(): SessionOptions {
  const ttlSeconds = env.AUTH_SESSION_TTL_HOURS * 60 * 60;
  return {
    cookieName: env.AUTH_SESSION_COOKIE_NAME,
    password: env.AUTH_SESSION_SECRET,
    ttl: ttlSeconds,
    cookieOptions: {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      path: '/',
      maxAge: ttlSeconds,
    },
  };
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions());
}

export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
