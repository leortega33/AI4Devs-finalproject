import { ProgressPhoto } from '../models/ProgressPhoto';

/** Input for a progress photo (the entry id comes from the route). */
export interface ProgressPhotoInput {
  storageKey: string;
  contentType: string;
}

/** Data access contract for progress photos (see docs/backend-standards.md). */
export interface ProgressPhotoRepository {
  create(progressEntryId: number, data: ProgressPhotoInput): Promise<ProgressPhoto>;
  listByEntryId(progressEntryId: number): Promise<ProgressPhoto[]>;
  listByEntryIds(progressEntryIds: number[]): Promise<ProgressPhoto[]>;
  findById(id: number): Promise<ProgressPhoto | null>;
  delete(id: number): Promise<void>;
}
