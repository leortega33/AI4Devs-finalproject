import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { LocalDiskPhotoStorage } from './photoStorage';

describe('LocalDiskPhotoStorage', () => {
  let dir: string;
  let storage: LocalDiskPhotoStorage;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'photo-storage-'));
    storage = new LocalDiskPhotoStorage(dir);
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('saves bytes and reads them back', async () => {
    const bytes = Buffer.from('hello-image');
    const key = await storage.save(bytes, 'image/webp');
    const read = await storage.read(key);
    expect(read.equals(bytes)).toBe(true);
  });

  it('generates a unique key per save', async () => {
    const key1 = await storage.save(Buffer.from('a'), 'image/webp');
    const key2 = await storage.save(Buffer.from('b'), 'image/webp');
    expect(key1).not.toEqual(key2);
  });

  it('creates the storage directory if it does not exist', async () => {
    const nested = path.join(dir, 'nested', 'photos');
    const nestedStorage = new LocalDiskPhotoStorage(nested);
    const key = await nestedStorage.save(Buffer.from('x'), 'image/webp');
    const read = await nestedStorage.read(key);
    expect(read.equals(Buffer.from('x'))).toBe(true);
  });

  it('deletes a stored file', async () => {
    const key = await storage.save(Buffer.from('gone'), 'image/webp');
    await storage.delete(key);
    await expect(storage.read(key)).rejects.toThrow();
  });

  it('does not throw when deleting a missing key', async () => {
    await expect(storage.delete('does-not-exist.webp')).resolves.toBeUndefined();
  });

  it('rejects a key that escapes the storage directory', async () => {
    await expect(storage.read('../escape.webp')).rejects.toThrow();
  });
});
