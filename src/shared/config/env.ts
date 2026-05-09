import { z } from 'zod';

/**
 * Centralized, validated environment configuration.
 *
 * Notes:
 * - All accessors return strongly-typed values; missing required values throw at import time.
 * - Avoids using `process.env` directly throughout the app to prevent typos and silent fallbacks.
 * - When extending, prefer feature flags (`FEATURE_*`) over conditional code branches.
 */

const booleanString = z
  .union([z.literal('true'), z.literal('false'), z.literal('1'), z.literal('0')])
  .transform((v) => v === 'true' || v === '1');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  APP_NAME: z.string().min(1).default('SIAKAD Sekolah Indonesia'),
  APP_TIMEZONE: z.string().min(1).default('Asia/Jakarta'),

  DATABASE_URL: z.string().min(1).default('mysql://siakad:siakad@localhost:3306/siakad'),
  DATABASE_READ_URL: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),

  AUTH_SESSION_SECRET: z
    .string()
    .min(32)
    .default('dev-only-session-secret-change-me-please-1234567890'),
  AUTH_JWT_SECRET: z.string().min(32).default('dev-only-jwt-secret-change-me-please-1234567890ab'),
  AUTH_JWT_ISSUER: z.string().default('siakad'),
  AUTH_JWT_AUDIENCE: z.string().default('siakad-users'),
  AUTH_SESSION_COOKIE_NAME: z.string().default('siakad_session'),
  AUTH_SESSION_TTL_HOURS: z.coerce.number().int().positive().default(8),
  AUTH_REMEMBER_ME_TTL_DAYS: z.coerce.number().int().positive().default(30),

  CAPTCHA_TTL_SECONDS: z.coerce.number().int().positive().default(180),
  CAPTCHA_HMAC_SECRET: z.string().min(16).default('dev-only-captcha-hmac-change-me'),

  REDIS_URL: z.string().default('redis://localhost:6379/0'),

  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_DIR: z.string().default('./storage'),
  STORAGE_PUBLIC_URL_BASE: z.string().default('http://localhost:3000/uploads'),
  S3_ENDPOINT: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  S3_REGION: z.string().default('ap-southeast-3'),
  S3_BUCKET: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  S3_ACCESS_KEY_ID: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  S3_SECRET_ACCESS_KEY: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  S3_FORCE_PATH_STYLE: booleanString.default('true'),

  MAIL_HOST: z.string().default('localhost'),
  MAIL_PORT: z.coerce.number().int().positive().default(587),
  MAIL_SECURE: booleanString.default('false'),
  MAIL_USER: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  MAIL_PASSWORD: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  MAIL_FROM: z.string().default('SIAKAD <no-reply@example.com>'),

  WA_PROVIDER: z.enum(['disabled', 'twilio', 'meta', 'fonnte', 'custom']).default('disabled'),
  WA_API_URL: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  WA_API_KEY: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  WA_SENDER_ID: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),

  PAYMENT_PROVIDER: z.enum(['midtrans', 'qris', 'disabled']).default('disabled'),
  MIDTRANS_SERVER_KEY: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  MIDTRANS_CLIENT_KEY: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  MIDTRANS_IS_PRODUCTION: booleanString.default('false'),
  QRIS_MERCHANT_ID: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),

  RATE_LIMIT_LOGIN_PER_MINUTE: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_API_PER_MINUTE: z.coerce.number().int().positive().default(120),
  ENABLE_HSTS_PRELOAD: booleanString.default('false'),

  FEATURE_MFA_TOTP: booleanString.default('false'),
  FEATURE_PUSH_NOTIFICATIONS: booleanString.default('true'),
  FEATURE_PWA: booleanString.default('true'),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  PINO_PRETTY: booleanString.default('true'),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment configuration: ${JSON.stringify(formatted)}`);
  }
  cached = parsed.data;
  return cached;
}

export const env = new Proxy({} as AppEnv, {
  get(_target, prop) {
    return getEnv()[prop as keyof AppEnv];
  },
});
