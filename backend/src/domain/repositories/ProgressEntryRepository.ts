import { ProgressEntry } from '../models/ProgressEntry';

/** Input for a progress entry (clientId comes from the route). */
export interface ProgressEntryInput {
  date: Date;
  weightKg?: number | null;
  bodyFatPercent?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  armCm?: number | null;
  thighCm?: number | null;
  note?: string | null;
}

/** Data access contract for client progress entries (see docs/backend-standards.md). */
export interface ProgressEntryRepository {
  create(clientId: number, data: ProgressEntryInput): Promise<ProgressEntry>;
  listByClientId(clientId: number): Promise<ProgressEntry[]>;
  findById(id: number): Promise<ProgressEntry | null>;
  delete(id: number): Promise<void>;
}
