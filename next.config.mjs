// @ts-check

/**
 * Next.js configuration for SIAKAD PWA.
 *
 * Notes:
 * - Strict React + standalone output (cocok untuk dijalankan via `node server.js`
 *   atau systemd unit; lihat README §7 untuk setup baremetal).
 * - Security headers applied at edge for all responses; tightened by middleware
 *   per-route as needed (`src/shared/security/headers.ts`).
 * - PWA service worker is served from `public/sw.js` and registered manually
 *   from the client provider so we don't pull in extra build plugins.
 */

const isDev = process.env.NODE_ENV !== 'production';

const cspDirectives = [
  "default-src 'self'",
  // Inline styles needed for Next.js critical CSS; nonces preferred in production via middleware.
  "style-src 'self' 'unsafe-inline'",
  // 'unsafe-eval' only allowed in dev for HMR. In production scripts are self-only + nonce.
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
];

const securityHeaders = [
  { key: 'Content-Security-Policy', value: cspDirectives.join('; ') },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  poweredByHeader: false,
  typedRoutes: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Service worker must be served with a non-cached header so updates roll out.
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;
