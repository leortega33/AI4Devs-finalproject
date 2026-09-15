export interface MedicalRecordProps {
  id?: number;
  clientId: number;
  preexistingConditions?: string | null;
  injuries?: string | null;
  surgeriesOrProsthetics?: string | null;
  physicalRestrictions?: string | null;
  medication?: string | null;
  allergies?: string | null;
  bloodType?: string | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/** A client's optional medical file (see docs/data-model.md entity #3, US-003). */
export class MedicalRecord {
  readonly id?: number;
  readonly clientId: number;
  readonly preexistingConditions: string | null;
  readonly injuries: string | null;
  readonly surgeriesOrProsthetics: string | null;
  readonly physicalRestrictions: string | null;
  readonly medication: string | null;
  readonly allergies: string | null;
  readonly bloodType: string | null;
  readonly notes: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: MedicalRecordProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.preexistingConditions = props.preexistingConditions ?? null;
    this.injuries = props.injuries ?? null;
    this.surgeriesOrProsthetics = props.surgeriesOrProsthetics ?? null;
    this.physicalRestrictions = props.physicalRestrictions ?? null;
    this.medication = props.medication ?? null;
    this.allergies = props.allergies ?? null;
    this.bloodType = props.bloodType ?? null;
    this.notes = props.notes ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
