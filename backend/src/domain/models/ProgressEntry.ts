export interface ProgressEntryProps {
  id?: number;
  clientId: number;
  date: Date;
  weightKg?: number | null;
  bodyFatPercent?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  armCm?: number | null;
  thighCm?: number | null;
  note?: string | null;
  createdAt?: Date;
}

/** A dated body-measurement entry for a client (see US-026). */
export class ProgressEntry {
  readonly id?: number;
  readonly clientId: number;
  readonly date: Date;
  readonly weightKg: number | null;
  readonly bodyFatPercent: number | null;
  readonly chestCm: number | null;
  readonly waistCm: number | null;
  readonly hipsCm: number | null;
  readonly armCm: number | null;
  readonly thighCm: number | null;
  readonly note: string | null;
  readonly createdAt?: Date;

  constructor(props: ProgressEntryProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.date = props.date;
    this.weightKg = props.weightKg ?? null;
    this.bodyFatPercent = props.bodyFatPercent ?? null;
    this.chestCm = props.chestCm ?? null;
    this.waistCm = props.waistCm ?? null;
    this.hipsCm = props.hipsCm ?? null;
    this.armCm = props.armCm ?? null;
    this.thighCm = props.thighCm ?? null;
    this.note = props.note ?? null;
    this.createdAt = props.createdAt;
  }
}
