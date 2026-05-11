import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 CLI config.
 *
 * - The runtime client uses a driver adapter (`@prisma/adapter-mariadb`); see
 *   `src/shared/db/prisma.ts`.
 * - This file is consumed by the Prisma CLI for `migrate`, `db push`, `studio`, etc.
 *
 * Note on `.env`:
 *   Prisma 7 **tidak** lagi auto-load `.env` saat ada `prisma.config.ts`. Selain itu,
 *   `bun run <script>` me-load `.env` ke `process.env` Bun-nya sendiri tapi
 *   **tidak meneruskan** ke child process (Prisma CLI dijalankan sebagai child
 *   Node). Akibatnya `bun run prisma:deploy` gagal dengan
 *   "Connection url is empty" walau `.env` ada. Untuk mengatasinya kita memuat
 *   `.env` manual di sini (parser kecil, hanya pakai built-in Node). Variabel
 *   yang sudah ada di shell tetap diprioritaskan.
 *
 * Note on `DATABASE_URL`:
 *   Setelah `.env` dimuat di atas, kita tetap memakai `process.env.DATABASE_URL`
 *   dengan fallback string kosong — bukan `env('DATABASE_URL')` strict dari
 *   `prisma/config` — supaya `prisma generate` di CI/sandbox (tanpa DB asli)
 *   tetap berhasil. Perintah yang benar-benar menyentuh DB (`migrate deploy`,
 *   `db push`, `studio`) akan tetap gagal-loud lewat Prisma sendiri.
 *
 * Multi-database migration:
 *   - Switch the `provider` in `prisma/schema.prisma` to `postgresql`, `sqlserver`, or
 *     use the dedicated Oracle adapter and update the URL in `.env` accordingly.
 */
function loadDotenv(file: string): void {
  if (!existsSync(file)) return;
  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (process.env[key]) continue; // shell takes precedence over .env
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadDotenv(resolve(process.cwd(), '.env'));

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
  migrations: {
    // Bun menjalankan file TypeScript secara native; tidak butuh tsx/ts-node.
    seed: 'bun prisma/seed.ts',
  },
});
