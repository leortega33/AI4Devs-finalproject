import { ProgressEntry } from '../../domain/models/ProgressEntry';
import {
  ProgressEntryRepository,
  ProgressEntryInput,
} from '../../domain/repositories/ProgressEntryRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { ClientNotFoundError } from './clientService';
import { ValidationError } from '../validator';

/** Thrown when a progress entry cannot be found (mapped to HTTP 404). */
export class ProgressEntryNotFoundError extends Error {
  constructor() {
    super('Progress entry not found');
    this.name = 'ProgressEntryNotFoundError';
  }
}

export interface ProgressSummary {
  latestWeightKg: number | null;
  weightChangeKg: number | null;
  entryCount: number;
}

export interface ProgressList {
  entries: ProgressEntry[];
  summary: ProgressSummary;
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

/** Business logic for client progress tracking by measurements (see US-026). */
export class ProgressService {
  constructor(
    private readonly progressEntryRepository: ProgressEntryRepository,
    private readonly clientRepository: ClientRepository,
  ) {}

  async record(clientId: number, data: RecordProgressInput): Promise<ProgressEntry> {
    await this.ensureClientExists(clientId);
    if (!METRIC_KEYS.some((key) => data[key] != null)) {
      throw new ValidationError('At least one measurement is required');
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
    return this.progressEntryRepository.create(clientId, input);
  }

  async list(clientId: number): Promise<ProgressList> {
    await this.ensureClientExists(clientId);
    const entries = await this.progressEntryRepository.listByClientId(clientId);
    return { entries, summary: this.buildSummary(entries) };
  }

  async remove(id: number): Promise<void> {
    const existing = await this.progressEntryRepository.findById(id);
    if (!existing) {
      throw new ProgressEntryNotFoundError();
    }
    await this.progressEntryRepository.delete(id);
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
