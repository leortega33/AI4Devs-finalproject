import { Attendance } from '../../domain/models/Attendance';
import {
  AttendanceRepository,
  AttendanceInput,
} from '../../domain/repositories/AttendanceRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { ClientNotFoundError } from './clientService';

/** Thrown when a check-in cannot be found (mapped to HTTP 404). */
export class AttendanceNotFoundError extends Error {
  constructor() {
    super('Attendance not found');
    this.name = 'AttendanceNotFoundError';
  }
}

export interface AttendanceSummary {
  total: number;
  thisMonth: number;
  last30Days: number;
  lastCheckInAt: string | null;
}

export interface AttendanceList {
  attendances: Attendance[];
  summary: AttendanceSummary;
}

/** Input for recording a check-in; `checkInAt` is optional and defaults to now. */
export interface RecordAttendanceInput {
  checkInAt?: Date;
  note?: string | null;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Business logic for client attendance / check-ins (see US-025). */
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly clientRepository: ClientRepository,
  ) {}

  async record(clientId: number, data: RecordAttendanceInput): Promise<Attendance> {
    await this.ensureClientExists(clientId);
    const input: AttendanceInput = { checkInAt: data.checkInAt ?? new Date(), note: data.note ?? null };
    return this.attendanceRepository.create(clientId, input);
  }

  async list(clientId: number, now: Date = new Date()): Promise<AttendanceList> {
    await this.ensureClientExists(clientId);
    const attendances = await this.attendanceRepository.listByClientId(clientId);
    return { attendances, summary: this.buildSummary(attendances, now) };
  }

  async remove(id: number): Promise<void> {
    const existing = await this.attendanceRepository.findById(id);
    if (!existing) {
      throw new AttendanceNotFoundError();
    }
    await this.attendanceRepository.delete(id);
  }

  private buildSummary(attendances: Attendance[], now: Date): AttendanceSummary {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * MS_PER_DAY);
    let thisMonth = 0;
    let last30Days = 0;
    for (const a of attendances) {
      if (a.checkInAt.getFullYear() === now.getFullYear() && a.checkInAt.getMonth() === now.getMonth()) {
        thisMonth += 1;
      }
      if (a.checkInAt >= thirtyDaysAgo && a.checkInAt <= now) {
        last30Days += 1;
      }
    }
    // The list is newest first, so the first entry is the last check-in.
    const lastCheckInAt = attendances.length > 0 ? attendances[0].checkInAt.toISOString() : null;
    return { total: attendances.length, thisMonth, last30Days, lastCheckInAt };
  }

  private async ensureClientExists(clientId: number): Promise<void> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new ClientNotFoundError();
    }
  }
}
