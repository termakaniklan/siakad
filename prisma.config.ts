import { defineConfig, env } from 'prisma/config';

/**
 * Prisma 7 CLI config.
 *
 * - The runtime client uses a driver adapter (`@prisma/adapter-mariadb`); see
 *   `src/shared/db/prisma.ts`.
 * - This file is consumed by the Prisma CLI for `migrate`, `db push`, `studio`, etc.
 *
 * Multi-database migration:
 *   - Switch the `provider` in `prisma/schema.prisma` to `postgresql`, `sqlserver`, or
 *     use the dedicated Oracle adapter and update the URL in `.env` accordingly.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
