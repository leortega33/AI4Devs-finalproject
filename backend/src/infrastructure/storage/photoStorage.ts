import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

/** Abstraction over where progress-photo bytes live; the DB stores only the key. */
export interface PhotoStorage {
  save(bytes: Buffer, contentType: string): Promise<string>;
  read(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}

/**
 * Default storage backend: writes files to a configured directory (mounted as a
 * persistent volume in production). Keys are generated uuids so requests can
 * never control or traverse the stored path (US-026b).
 */
export class LocalDiskPhotoStorage implements PhotoStorage {
  constructor(private readonly baseDir: string) {}

  async save(bytes: Buffer, _contentType: string): Promise<string> {
    await fs.mkdir(this.baseDir, { recursive: true });
    const key = `${randomUUID()}.webp`;
    await fs.writeFile(this.resolveKey(key), bytes);
    return key;
  }

  async read(key: string): Promise<Buffer> {
    return fs.readFile(this.resolveKey(key));
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(this.resolveKey(key));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return;
      }
      throw error;
    }
  }

  /** Resolves a key to an absolute path, rejecting anything outside baseDir. */
  private resolveKey(key: string): string {
    const base = path.resolve(this.baseDir);
    const resolved = path.resolve(base, key);
    if (resolved !== base && !resolved.startsWith(base + path.sep)) {
      throw new Error('Invalid storage key');
    }
    return resolved;
  }
}
