import { ProgressEntry } from './ProgressEntry';

describe('ProgressEntry', () => {
  it('should default optional metrics and the note to null', () => {
    const date = new Date('2026-09-21T10:00:00.000Z');
    const entry = new ProgressEntry({ clientId: 1, date, weightKg: 80 });

    expect(entry.clientId).toBe(1);
    expect(entry.date).toBe(date);
    expect(entry.weightKg).toBe(80);
    expect(entry.bodyFatPercent).toBeNull();
    expect(entry.waistCm).toBeNull();
    expect(entry.note).toBeNull();
  });

  it('should keep the provided values', () => {
    const date = new Date('2026-09-21T10:00:00.000Z');
    const entry = new ProgressEntry({ id: 5, clientId: 2, date, waistCm: 85, note: 'Buen progreso' });

    expect(entry.id).toBe(5);
    expect(entry.waistCm).toBe(85);
    expect(entry.note).toBe('Buen progreso');
  });
});
