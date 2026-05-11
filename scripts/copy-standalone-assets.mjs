#!/usr/bin/env node
/**
 * Copy assets yang TIDAK ikut otomatis di `output: 'standalone'`.
 *
 * Next.js standalone hanya menghasilkan `.next/standalone/server.js` +
 * `.next/standalone/node_modules/` (subset minimal). Asset publik (`public/`)
 * dan asset client (`.next/static/`) HARUS disalin manual; tanpa itu, server
 * standalone akan merespon 404 untuk semua chunk JS, CSS, font, gambar di
 * `public/`, manifest, service worker, dst.
 *
 * Skrip ini dipanggil otomatis oleh `bun run build` (lewat `postbuild` di
 * package.json) sehingga `.next/standalone/` langsung siap deploy.
 *
 * Aman dijalankan ulang (idempotent): `fs.cpSync` dengan `force: true` akan
 * meng-overwrite file yang sudah ada.
 */
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const standaloneDir = resolve(repoRoot, '.next', 'standalone');

if (!existsSync(standaloneDir)) {
  console.error(
    '[copy-standalone-assets] .next/standalone tidak ditemukan. ' +
      'Pastikan `next.config.mjs` punya `output: "standalone"` dan `bun run build` sudah berjalan.',
  );
  process.exit(1);
}

/** @type {Array<[string, string, string]>} */
const copies = [
  // [source absolute, destination absolute, label]
  [resolve(repoRoot, 'public'), resolve(standaloneDir, 'public'), 'public/'],
  [
    resolve(repoRoot, '.next', 'static'),
    resolve(standaloneDir, '.next', 'static'),
    '.next/static/',
  ],
];

let copied = 0;
for (const [src, dest, label] of copies) {
  if (!existsSync(src)) {
    console.warn(`[copy-standalone-assets] sumber tidak ada, dilewati: ${label}`);
    continue;
  }
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true, force: true, dereference: true });
  console.log(`[copy-standalone-assets] disalin: ${label} -> .next/standalone/${label}`);
  copied += 1;
}

if (copied === 0) {
  console.error('[copy-standalone-assets] tidak ada folder yang disalin (semua sumber hilang).');
  process.exit(1);
}

console.log(`[copy-standalone-assets] selesai (${copied} folder).`);
