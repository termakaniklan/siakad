import type { NextResponse } from 'next/server';

/**
 * Security header presets.
 *
 * The base CSP is set in `next.config.mjs#headers()`. This helper tightens
 * headers per-route, e.g. for download endpoints that need a stricter
 * `Content-Disposition` and disabled framing.
 */
export function applySecureDownloadHeaders(res: NextResponse, filename: string): NextResponse {
  res.headers.set('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '')}"`);
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}

export function applyNoStoreHeaders(res: NextResponse): NextResponse {
  res.headers.set('Cache-Control', 'no-store, max-age=0');
  res.headers.set('Pragma', 'no-cache');
  return res;
}
