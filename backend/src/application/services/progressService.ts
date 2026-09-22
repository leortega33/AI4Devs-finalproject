import { ProgressEntry } from '../../domain/models/ProgressEntry';
import { ProgressPhoto } from '../../domain/models/ProgressPhoto';
import {
  ProgressEntryRepository,
  ProgressEntryInput,
} from '../../domain/repositories/ProgressEntryRepository';
import { ProgressPhotoRepository } from '../../domain/repositories/ProgressPhotoRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { PhotoStorage } from '../../infrastructure/storage/photoStorage';
import { processProgressPhoto } from '../imageProcessing';
import { ClientNotFoundError } from './clientService';
import { ValidationError } from '../validator';

/** Thrown when a progress entry cannot be found (mapped to HTTP 404). */
export class ProgressEntryNotFoundError extends Error {
  constructor() {
    super('Progress entry not found');
    this.name = 'ProgressEntryNotFoundError';
  }
}

/** Thrown when a progress photo cannot be found (mapped to HTTP 404). */
export class ProgressPhotoNotFoundError extends Error {
  constructor() {
    super('Progress photo not found');
    this.name = 'ProgressPhotoNotFoundError';
  }
}

export interface ProgressSummary {
  latestWeightKg: number | null;
  weightChangeKg: number | null;
  entryCount: number;
}

/** A photo reference exposed to clients (the bytes are served separately). */
export interface ProgressPhotoView {
  id: number;
  contentType: string;
}

/** A progress entry plus its attached photo references. */
export type ProgressEntryWithPhotos = ProgressEntry & { photos: ProgressPhotoView[] };

export interface ProgressList {
  entries: ProgressEntryWithPhotos[];
  summary: ProgressSummary;
}

/** An uploaded image file to attach to an entry. */
export interface PhotoUpload {
  mimetype: string;
  buffer: Buffer;
}

/** The bytes of a stored photo, ready to stream. */
export interface PhotoBytes {
  bytes: Buffer;
  contentType: string;
}

/** Input for recording a progress entry; `date` is optional and defaults to now. */
export interface RecordProgressInput {
  date?: Date;
  weightKg?: number | null;
  bodyFatPercent?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  armCm?: number | null;
  thighCm?: number | null;
  note?: string | null;
}

const METRIC_KEYS = [
  'weightKg',
  'bodyFatPercent',
  'chestCm',
  'waistCm',
  'hipsCm',
  'armCm',
  'thighCm',
] as const;

/** Business logic for client progress tracking: measurements (US-026) + photos (US-026b). */
export class ProgressService {
  constructor(
    private readonly progressEntryRepository: ProgressEntryRepository,
    private readonly clientRepository: ClientRepository,
    private readonly progressPhotoRepository: ProgressPhotoRepository,
    private readonly photoStorage: PhotoStorage,
  ) {}

  async record(
    clientId: number,
    data: RecordProgressInput,
    files: PhotoUpload[] = [],
  ): Promise<ProgressEntryWithPhotos> {
    await this.ensureClientExists(clientId);
    const hasMetric = METRIC_KEYS.some((key) => data[key] != null);
    if (!hasMetric && files.length === 0) {
      throw new ValidationError('At least one measurement or photo is required');
    }
    const input: ProgressEntryInput = {
      date: data.date ?? new Date(),
      weightKg: data.weightKg ?? null,
      bodyFatPercent: data.bodyFatPercent ?? null,
      chestCm: data.chestCm ?? null,
      waistCm: data.waistCm ?? null,
      hipsCm: data.hipsCm ?? null,
      armCm: data.armCm ?? null,
      thighCm: data.thighCm ?? null,
      note: data.note ?? null,
    };
    const entry = await this.progressEntryRepository.create(clientId, input);
    let photos: ProgressPhoto[];
    try {
      photos = await this.storePhotos(entry.id as number, files);
    } catch (error) {
      // Roll back the entry so a failed upload never leaves a partial entry.
      await this.progressEntryRepository.delete(entry.id as number);
      throw error;
    }
    return this.withPhotos(entry, photos);
  }

  async list(clientId: number): Promise<ProgressList> {
    await this.ensureClientExists(clientId);
    const entries = await this.progressEntryRepository.listByClientId(clientId);
    const photos = await this.progressPhotoRepository.listByEntryIds(
      entries.map((e) => e.id as number),
    );
    const entriesWithPhotos = entries.map((entry) =>
      this.withPhotos(
        entry,
        photos.filter((p) => p.progressEntryId === entry.id),
      ),
    );
    return { entries: entriesWithPhotos, summary: this.buildSummary(entries) };
  }

  async addPhotos(clientId: number, entryId: number, files: PhotoUpload[]): Promise<ProgressPhotoView[]> {
    await this.ensureClientExists(clientId);
    const entry = await this.progressEntryRepository.findById(entryId);
    if (!entry || entry.clientId !== clientId) {
      throw new ProgressEntryNotFoundError();
    }
    if (files.length === 0) {
      throw new ValidationError('At least one photo is required');
    }
    const photos = await this.storePhotos(entryId, files);
    return photos.map((p) => this.toPhotoView(p));
  }

  async getPhoto(photoId: number): Promise<PhotoBytes> {
    const photo = await this.progressPhotoRepository.findById(photoId);
    if (!photo) {
      throw new ProgressPhotoNotFoundError();
    }
    const bytes = await this.photoStorage.read(photo.storageKey);
    return { bytes, contentType: photo.contentType };
  }

  async removePhoto(photoId: number): Promise<void> {
    const photo = await this.progressPhotoRepository.findById(photoId);
    if (!photo) {
      throw new ProgressPhotoNotFoundError();
    }
    await this.photoStorage.delete(photo.storageKey);
    await this.progressPhotoRepository.delete(photoId);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.progressEntryRepository.findById(id);
    if (!existing) {
      throw new ProgressEntryNotFoundError();
    }
    // Remove files first; the DB cascade removes the photo rows with the entry.
    const photos = await this.progressPhotoRepository.listByEntryId(id);
    for (const photo of photos) {
      await this.photoStorage.delete(photo.storageKey);
    }
    await this.progressEntryRepository.delete(id);
  }

  /** Processes, stores, and records each uploaded file; rolls back on failure. */
  private async storePhotos(entryId: number, files: PhotoUpload[]): Promise<ProgressPhoto[]> {
    const storedKeys: string[] = [];
    const created: ProgressPhoto[] = [];
    try {
      for (const file of files) {
        const processed = await processProgressPhoto(file);
        const storageKey = await this.photoStorage.save(processed.bytes, processed.contentType);
        storedKeys.push(storageKey);
        const photo = await this.progressPhotoRepository.create(entryId, {
          storageKey,
          contentType: processed.contentType,
        });
        created.push(photo);
      }
      return created;
    } catch (error) {
      for (const key of storedKeys) {
        await this.photoStorage.delete(key);
      }
      throw error;
    }
  }

  private withPhotos(entry: ProgressEntry, photos: ProgressPhoto[]): ProgressEntryWithPhotos {
    return Object.assign(Object.create(Object.getPrototypeOf(entry)), entry, {
      photos: photos.map((p) => this.toPhotoView(p)),
    });
  }

  private toPhotoView(photo: ProgressPhoto): ProgressPhotoView {
    return { id: photo.id as number, contentType: photo.contentType };
  }

  private buildSummary(entries: ProgressEntry[]): ProgressSummary {
    // entries are newest first; weighed entries keep that order.
    const weighed = entries.filter((e) => e.weightKg != null);
    const latestWeightKg = weighed.length > 0 ? (weighed[0].weightKg as number) : null;
    const firstWeightKg = weighed.length > 0 ? (weighed[weighed.length - 1].weightKg as number) : null;
    const weightChangeKg =
      weighed.length >= 2 ? Number(((latestWeightKg as number) - (firstWeightKg as number)).toFixed(2)) : null;
    return { latestWeightKg, weightChangeKg, entryCount: entries.length };
  }

  private async ensureClientExists(clientId: number): Promise<void> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new ClientNotFoundError();
    }
  }
}
