export interface AttendanceProps {
  id?: number;
  clientId: number;
  checkInAt: Date;
  note?: string | null;
  createdAt?: Date;
}

/** A single client check-in recorded by the trainer (see US-025). */
export class Attendance {
  readonly id?: number;
  readonly clientId: number;
  readonly checkInAt: Date;
  readonly note: string | null;
  readonly createdAt?: Date;

  constructor(props: AttendanceProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.checkInAt = props.checkInAt;
    this.note = props.note ?? null;
    this.createdAt = props.createdAt;
  }
}
