import { PrismaClient, Prisma } from '@prisma/client';
import { Attendance } from '../../domain/models/Attendance';
import {
  AttendanceRepository,
  AttendanceInput,
} from '../../domain/repositories/AttendanceRepository';

type AttendanceRecord = Prisma.AttendanceGetPayload<Record<string, never>>;

function toDomain(record: AttendanceRecord): Attendance {
  return new Attendance(record);
}

export class PrismaAttendanceRepository implements AttendanceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(clientId: number, data: AttendanceInput): Promise<Attendance> {
    const record = await this.prisma.attendance.create({
      data: { clientId, checkInAt: data.checkInAt, note: data.note ?? null },
    });
    return toDomain(record);
  }

  async listByClientId(clientId: number): Promise<Attendance[]> {
    const records = await this.prisma.attendance.findMany({
      where: { clientId },
      orderBy: { checkInAt: 'desc' },
    });
    return records.map(toDomain);
  }

  async findById(id: number): Promise<Attendance | null> {
    const record = await this.prisma.attendance.findUnique({ where: { id } });
    return record ? toDomain(record) : null;
  }

  async delete(id: number): Promise<void> {
    await this.prisma.attendance.delete({ where: { id } });
  }
}
