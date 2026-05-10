/**
 * Local filesystem storage helper.
 *
 * Used to persist user-supplied uploads (profile avatars, branding assets, etc.)
 * to a directory under `STORAGE_LOCAL_DIR` and expose them via Next.js' `public/`
 * symlink convention (`public/uploads/<bucket>/<file>`).
 *
 * Security:
 *  - Filenames are randomly generated, never derived from the user's input,
 *    so path traversal (`../`) and reserved-name attacks are impossible.
 *  - MIME / extension is whitelisted by callers before writing.
 *  - Magic-byte sniffing keeps an attacker from uploading e.g. an EXE renamed
 *    to `.png`.
 */
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { env } from '@/shared/config/env';

const PUBLIC_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

/** Ensure a bucket directory exists under public/uploads/. */
async function ensureBucket(bucket: string): Promise<string> {
  const safe = bucket.replace(/[^a-z0-9-]/gi, '');
  if (!safe) throw new Error('invalid_bucket');
  const dir = path.join(PUBLIC_UPLOAD_DIR, safe);
  await mkdir(dir, { recursive: true });
  return dir;
}

const PNG = [0x89, 0x50, 0x4e, 0x47];
const JPG = [0xff, 0xd8, 0xff];
const GIF = [0x47, 0x49, 0x46, 0x38];
const WEBP = [0x52, 0x49, 0x46, 0x46]; // RIFF...WEBP
const ICO = [0x00, 0x00, 0x01, 0x00];
const SVG_PREFIX = '<svg';
const SVG_PREFIX2 = '<?xml';

function startsWith(buf: Buffer, prefix: number[]): boolean {
  if (buf.length < prefix.length) return false;
  for (let i = 0; i < prefix.length; i++) if (buf[i] !== prefix[i]) return false;
  return true;
}

export type ImageKind = 'png' | 'jpg' | 'gif' | 'webp' | 'ico' | 'svg';

export function detectImageKind(buf: Buffer): ImageKind | null {
  if (startsWith(buf, PNG)) return 'png';
  if (startsWith(buf, JPG)) return 'jpg';
  if (startsWith(buf, GIF)) return 'gif';
  if (startsWith(buf, WEBP) && buf.slice(8, 12).toString('ascii') === 'WEBP') return 'webp';
  if (startsWith(buf, ICO)) return 'ico';
  const head = buf.slice(0, 200).toString('utf8').trimStart();
  if (head.startsWith(SVG_PREFIX) || head.startsWith(SVG_PREFIX2)) return 'svg';
  return null;
}

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_BG_BYTES = 4 * 1024 * 1024; // 4 MB

export interface SaveResult {
  url: string;
  filename: string;
  bytes: number;
  kind: ImageKind;
}

/**
 * Validate an image buffer and write it to `public/uploads/<bucket>/<uuid>.<ext>`.
 * Returns the public URL (relative path) the browser can fetch.
 */
export async function saveImage(
  bucket: string,
  buf: Buffer,
  opts: { maxBytes: number; allowed: ReadonlyArray<ImageKind> },
): Promise<SaveResult> {
  if (buf.length === 0) throw new Error('empty_file');
  if (buf.length > opts.maxBytes) throw new Error('file_too_large');
  const kind = detectImageKind(buf);
  if (!kind) throw new Error('unsupported_image');
  if (!opts.allowed.includes(kind)) throw new Error('disallowed_image_kind');

  const dir = await ensureBucket(bucket);
  const filename = `${randomUUID()}.${kind}`;
  const dest = path.join(dir, filename);
  await writeFile(dest, buf);

  // Public URL via `/uploads/<bucket>/<file>`. We deliberately use this path so
  // it's served straight by Next.js' static handler with caching headers.
  void env;
  return {
    url: `/uploads/${bucket}/${filename}`,
    filename,
    bytes: buf.length,
    kind,
  };
}
