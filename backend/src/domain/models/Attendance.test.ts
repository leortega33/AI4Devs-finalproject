import { Attendance } from './Attendance';

describe('Attendance', () => {
  it('should default the note to null', () => {
    const now = new Date('2026-09-20T10:00:00.000Z');
    const attendance = new Attendance({ clientId: 1, checkInAt: now });

    expect(attendance.clientId).toBe(1);
    expect(attendance.checkInAt).toBe(now);
    expect(attendance.note).toBeNull();
  });

  it('should keep the provided values', () => {
    const now = new Date('2026-09-20T10:00:00.000Z');
    const attendance = new Attendance({ id: 5, clientId: 2, checkInAt: now, note: 'Buena sesión' });

    expect(attendance.id).toBe(5);
    expect(attendance.note).toBe('Buena sesión');
  });
});
