import { AttendanceService, AttendanceNotFoundError } from './attendanceService';
import { ClientNotFoundError } from './clientService';
import { Attendance } from '../../domain/models/Attendance';
import { Client } from '../../domain/models/Client';
import { AttendanceRepository } from '../../domain/repositories/AttendanceRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';

function buildAttendanceRepositoryMock(): jest.Mocked<AttendanceRepository> {
  return {
    create: jest.fn(),
    listByClientId: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
  };
}

function buildClientRepositoryMock(): jest.Mocked<ClientRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findByDni: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    setStatus: jest.fn(),
  };
}

function makeClient(): Client {
  return new Client({
    id: 10,
    firstName: 'Ana',
    lastName: 'Gómez',
    dni: '30111222',
    phone: '+540000',
    email: 'ana@example.com',
    birthDate: new Date('1990-01-01'),
  });
}

describe('AttendanceService', () => {
  let attendanceRepo: jest.Mocked<AttendanceRepository>;
  let clientRepo: jest.Mocked<ClientRepository>;
  let service: AttendanceService;

  beforeEach(() => {
    jest.clearAllMocks();
    attendanceRepo = buildAttendanceRepositoryMock();
    clientRepo = buildClientRepositoryMock();
    service = new AttendanceService(attendanceRepo, clientRepo);
  });

  describe('record', () => {
    it('defaults the check-in time to now when not provided', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      attendanceRepo.create.mockImplementation(async (clientId, data) => new Attendance({ id: 1, clientId, ...data }));

      const before = Date.now();
      const result = await service.record(10, {});
      const after = Date.now();

      expect(result.checkInAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.checkInAt.getTime()).toBeLessThanOrEqual(after);
      expect(attendanceRepo.create).toHaveBeenCalledWith(10, expect.objectContaining({ note: null }));
    });

    it('uses the provided time and note', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      const checkInAt = new Date('2026-09-18T08:00:00.000Z');
      attendanceRepo.create.mockResolvedValue(new Attendance({ id: 1, clientId: 10, checkInAt, note: 'Buena' }));

      await service.record(10, { checkInAt, note: 'Buena' });

      expect(attendanceRepo.create).toHaveBeenCalledWith(10, { checkInAt, note: 'Buena' });
    });

    it('throws when the client does not exist', async () => {
      clientRepo.findById.mockResolvedValue(null);

      await expect(service.record(999, {})).rejects.toThrow(ClientNotFoundError);
      expect(attendanceRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('returns check-ins newest first with a computed summary', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      const now = new Date('2026-09-20T12:00:00.000Z');
      attendanceRepo.listByClientId.mockResolvedValue([
        new Attendance({ id: 3, clientId: 10, checkInAt: new Date('2026-09-19T10:00:00.000Z') }), // this month, last 30d
        new Attendance({ id: 2, clientId: 10, checkInAt: new Date('2026-09-01T10:00:00.000Z') }), // this month, last 30d
        new Attendance({ id: 1, clientId: 10, checkInAt: new Date('2026-07-01T10:00:00.000Z') }), // older
      ]);

      const result = await service.list(10, now);

      expect(result.attendances[0].id).toBe(3);
      expect(result.summary).toEqual({
        total: 3,
        thisMonth: 2,
        last30Days: 2,
        lastCheckInAt: '2026-09-19T10:00:00.000Z',
      });
    });

    it('returns a zero summary for an empty attendance', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      attendanceRepo.listByClientId.mockResolvedValue([]);

      const result = await service.list(10, new Date('2026-09-20T12:00:00.000Z'));

      expect(result.summary).toEqual({ total: 0, thisMonth: 0, last30Days: 0, lastCheckInAt: null });
    });

    it('throws when the client does not exist', async () => {
      clientRepo.findById.mockResolvedValue(null);

      await expect(service.list(999)).rejects.toThrow(ClientNotFoundError);
    });
  });

  describe('remove', () => {
    it('deletes an existing check-in', async () => {
      attendanceRepo.findById.mockResolvedValue(new Attendance({ id: 5, clientId: 10, checkInAt: new Date() }));

      await service.remove(5);

      expect(attendanceRepo.delete).toHaveBeenCalledWith(5);
    });

    it('throws when the check-in does not exist', async () => {
      attendanceRepo.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(AttendanceNotFoundError);
      expect(attendanceRepo.delete).not.toHaveBeenCalled();
    });
  });
});
