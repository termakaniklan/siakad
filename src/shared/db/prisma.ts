import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

import { env } from '@/shared/config/env';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Singleton Prisma client.
 *
 * Prisma 7 uses driver adapters at runtime; the database URL is parsed from
 * `DATABASE_URL` (e.g. `mysql://user:pass@host:3306/dbname?connection_limit=20`).
 *
 * Multi-database compatibility:
 *  - Schema avoids vendor-specific types and uses neutral primitives so it can be
 *    regenerated against the equivalent Postgres / Oracle / MSSQL providers (see README §13).
 */
function buildClient(): PrismaClient {
  const url = new URL(env.DATABASE_URL);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    connectionLimit: Number(url.searchParams.get('connection_limit') ?? 10),
  });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = global.__prisma ?? buildClient();
if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
