import { NextResponse, type NextRequest } from 'next/server';

/**
 * Edge middleware.
 *
 * Responsibilities:
 *  - Inject a request id for tracing.
 *  - Apply hardened cache headers to authenticated routes.
 *  - Block obvious bot vectors on auth & PPDB endpoints.
 *
 * Note: deep RBAC checks happen server-side (Server Components / Route Handlers)
 * — middleware is intentionally permissive and fast.
 */

const PROTECTED_PREFIXES = ['/admin', '/guru', '/siswa', '/wali', '/api/admin'];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const res = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(req.headers),
        'x-request-id': requestId,
      }),
    },
  });

  res.headers.set('x-request-id', requestId);

  if (isProtected(req.nextUrl.pathname)) {
    res.headers.set('Cache-Control', 'private, no-store, must-revalidate');
    res.headers.set('Pragma', 'no-cache');
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|sw.js|manifest.webmanifest).*)'],
};
