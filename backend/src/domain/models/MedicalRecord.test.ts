import { MedicalRecord } from './MedicalRecord';

describe('MedicalRecord', () => {
  it('should default optional fields to null', () => {
    const record = new MedicalRecord({ clientId: 1 });

    expect(record.clientId).toBe(1);
    expect(record.preexistingConditions).toBeNull();
    expect(record.injuries).toBeNull();
    expect(record.surgeriesOrProsthetics).toBeNull();
    expect(record.physicalRestrictions).toBeNull();
    expect(record.medication).toBeNull();
    expect(record.allergies).toBeNull();
    expect(record.bloodType).toBeNull();
    expect(record.notes).toBeNull();
  });

  it('should keep the provided medical values', () => {
    const record = new MedicalRecord({
      id: 5,
      clientId: 2,
      preexistingConditions: 'Asthma',
      bloodType: 'O+',
      notes: 'Prefers morning sessions',
    });

    expect(record.id).toBe(5);
    expect(record.preexistingConditions).toBe('Asthma');
    expect(record.bloodType).toBe('O+');
    expect(record.notes).toBe('Prefers morning sessions');
  });
});
