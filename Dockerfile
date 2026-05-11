# syntax=docker/dockerfile:1.7
# Multi-stage build for SIAKAD PWA (Next.js standalone output)

ARG NODE_VERSION=22.12.0

# ---------- Stage 1: dependencies ----------
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app

# OS deps for argon2 native build + healthcheck.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
        python3 build-essential libssl-dev ca-certificates curl \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---------- Stage 2: builder ----------
FROM node:${NODE_VERSION}-bookworm-slim AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client before Next compile.
# `prisma.config.ts` membaca `process.env.DATABASE_URL ?? ''` agar codegen tidak
# memerlukan koneksi DB saat image dibangun. Variabel ini tetap wajib di runtime
# (`migrate deploy`, `db:seed`) — divalidasi oleh `src/shared/config/env.ts`.
RUN npx prisma generate
RUN npm run build

# ---------- Stage 3: runner ----------
FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl tini \
 && rm -rf /var/lib/apt/lists/* \
 && groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
