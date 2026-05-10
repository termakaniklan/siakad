import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { env } from '@/shared/config/env';
import { logger } from '@/shared/logger';

export interface StoredObject {
  key: string;
  url: string;
  bytes: number;
}

export interface StorageDriver {
  put(key: string, data: Uint8Array, mime: string): Promise<StoredObject>;
  publicUrl(key: string): string;
}

/**
 * Local filesystem storage. Files are written under `STORAGE_LOCAL_DIR` and served
 * via a static path. In production prefer the S3 driver behind the same interface.
 */
class LocalDriver implements StorageDriver {
  async put(key: string, data: Uint8Array, _mime: string): Promise<StoredObject> {
    const fullPath = join(env.STORAGE_LOCAL_DIR, key);
    await mkdir(join(fullPath, '..'), { recursive: true });
    await writeFile(fullPath, data);
    return { key, url: this.publicUrl(key), bytes: data.byteLength };
  }
  publicUrl(key: string): string {
    return `${env.STORAGE_PUBLIC_URL_BASE.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
  }
}

class S3Driver implements StorageDriver {
  async put(_key: string, _data: Uint8Array, _mime: string): Promise<StoredObject> {
    // S3 SDK intentionally not added to the runtime dep list yet; wire `@aws-sdk/client-s3`
    // here when enabling the cloud driver in production.
    logger.error('S3 driver not yet implemented — falling back to local.');
    throw new Error('S3 driver not implemented in this build.');
  }
  publicUrl(key: string): string {
    return `${env.STORAGE_PUBLIC_URL_BASE.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
  }
}

export function getStorage(): StorageDriver {
  return env.STORAGE_DRIVER === 's3' ? new S3Driver() : new LocalDriver();
}
