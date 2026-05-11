import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 CLI config.
 *
 * - The runtime client uses a driver adapter (`@prisma/adapter-mariadb`); see
 *   `src/shared/db/prisma.ts`.
 * - This file is consumed by the Prisma CLI for `migrate`, `db push`, `studio`, etc.
 *
 * Note on `DATABASE_URL`:
 *   We read `process.env.DATABASE_URL` directly (with an empty fallback) instead of
 *   the strict `env()` helper from `prisma/config`. The helper throws at config-load
 *   time when the variable is missing, which breaks build-time codegen such as
 *   `prisma generate` in CI/sandbox environments where the runtime DB URL is not
 *   yet available. Commands that actually contact the DB — `migrate dev`,
 *   `migrate deploy`, `db push`, `studio` — still fail loudly when the URL is empty.
 *
 * Multi-database migration:
 *   - Switch the `provider` in `prisma/schema.prisma` to `postgresql`, `sqlserver`, or
 *     use the dedicated Oracle adapter and update the URL in `.env` accordingly.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
