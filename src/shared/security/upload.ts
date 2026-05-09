import { extname } from 'node:path';

/**
 * File upload hardening helpers.
 *
 * - Whitelist-only MIME validation; never trust the client-provided content-type alone.
 * - Optional malware-scan hook (see `scanFileHook`) intended to be wired to ClamAV / VirusTotal
 *   in production. The default no-op returns `{ clean: true }`.
 */

export interface UploadValidationOptions {
  maxBytes: number;
  allowedMime: ReadonlyArray<string>;
  allowedExt: ReadonlyArray<string>;
  // `magicBytes` lets callers add file-signature checks (e.g. PNG: 89 50 4E 47).
  magicBytes?: ReadonlyArray<{ ext: string; signature: ReadonlyArray<number> }>;
}

export type UploadValidationResult =
  | { ok: true; ext: string; mime: string }
  | { ok: false; reason: string };

export function validateUpload(
  filename: string,
  mime: string,
  buf: Uint8Array,
  opts: UploadValidationOptions,
): UploadValidationResult {
  if (buf.byteLength > opts.maxBytes) {
    return {
      ok: false,
      reason: `Ukuran file melebihi ${(opts.maxBytes / (1024 * 1024)).toFixed(1)} MB.`,
    };
  }
  const ext = extname(filename).slice(1).toLowerCase();
  if (!opts.allowedExt.includes(ext)) {
    return { ok: false, reason: `Ekstensi .${ext} tidak diizinkan.` };
  }
  if (!opts.allowedMime.includes(mime)) {
    return { ok: false, reason: `MIME ${mime} tidak diizinkan.` };
  }
  if (opts.magicBytes) {
    const m = opts.magicBytes.find((x) => x.ext === ext);
    if (m && !startsWith(buf, m.signature)) {
      return { ok: false, reason: 'Magic bytes tidak cocok dengan ekstensi.' };
    }
  }
  return { ok: true, ext, mime };
}

function startsWith(buf: Uint8Array, sig: ReadonlyArray<number>): boolean {
  if (buf.byteLength < sig.length) return false;
  for (let i = 0; i < sig.length; i++) {
    if (buf[i] !== sig[i]) return false;
  }
  return true;
}

export type ScanResult = { clean: boolean; reason?: string };

/** Default no-op malware hook. Replace with ClamAV / VT in production. */
export const scanFileHook: (buf: Uint8Array) => Promise<ScanResult> = async () => ({ clean: true });
