import argon2 from 'argon2';

/**
 * Argon2id password hashing — OWASP recommended parameters (2024 baseline).
 *
 * Parameters tuned for ~100ms on a modern x86_64 server core. Tune `memoryCost`
 * upward if you have headroom; never below 19MiB per OWASP cheat sheet.
 */
const ARGON_OPTS: argon2.Options & { type: 2 } = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 3,
  parallelism: 1,
};

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON_OPTS);
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

export interface PasswordStrength {
  ok: boolean;
  score: number;
  reasons: string[];
}

/** Lightweight password policy. Aligns with OWASP ASVS L1 for password complexity. */
export function evaluatePassword(plain: string): PasswordStrength {
  const reasons: string[] = [];
  if (plain.length < 10) reasons.push('Password minimal 10 karakter.');
  if (!/[A-Z]/.test(plain)) reasons.push('Harus memiliki huruf kapital.');
  if (!/[a-z]/.test(plain)) reasons.push('Harus memiliki huruf kecil.');
  if (!/[0-9]/.test(plain)) reasons.push('Harus memiliki angka.');
  if (!/[^A-Za-z0-9]/.test(plain)) reasons.push('Harus memiliki simbol.');
  const score = 5 - reasons.length;
  return { ok: reasons.length === 0, score, reasons };
}
