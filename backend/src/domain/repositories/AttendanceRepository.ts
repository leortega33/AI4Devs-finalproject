import { Attendance } from '../models/Attendance';

/** Input for recording a check-in (clientId comes from the route). */
export interface AttendanceInput {
  checkInAt: Date;
  note?: string | null;
}

/** Data access contract for client attendance (see docs/backend-standards.md). */
export interface AttendanceRepository {
  create(clientId: number, data: AttendanceInput): Promise<Attendance>;
  listByClientId(clientId: number): Promise<Attendance[]>;
  findById(id: number): Promise<Attendance | null>;
  delete(id: number): Promise<void>;
}
