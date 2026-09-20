import { MedicalRecordVersion } from './MedicalRecordVersion';

describe('MedicalRecordVersion', () => {
  it('should default optional fields to null', () => {
    const now = new Date('2026-09-20T10:00:00.000Z');
    const version = new MedicalRecordVersion({ clientId: 1, createdAt: now });

    expect(version.clientId).toBe(1);
    expect(version.createdAt).toBe(now);
    expect(version.preexistingConditions).toBeNull();
    expect(version.injuries).toBeNull();
    expect(version.surgeriesOrProsthetics).toBeNull();
    expect(version.physicalRestrictions).toBeNull();
    expect(version.medication).toBeNull();
    expect(version.allergies).toBeNull();
    expect(version.bloodType).toBeNull();
    expect(version.notes).toBeNull();
  });

  it('should keep the provided snapshot values', () => {
    const now = new Date('2026-09-20T10:00:00.000Z');
    const version = new MedicalRecordVersion({
      id: 7,
      clientId: 2,
      injuries: 'Knee',
      bloodType: 'O+',
      createdAt: now,
    });

    expect(version.id).toBe(7);
    expect(version.clientId).toBe(2);
    expect(version.injuries).toBe('Knee');
    expect(version.bloodType).toBe('O+');
    expect(version.createdAt).toBe(now);
  });
});
