import { RoutineSession } from './RoutineSession';

export type RoutineStatus = 'draft' | 'active' | 'expired';

export interface RoutineTemplateProps {
  id?: number;
  name: string;
  description?: string | null;
  objective?: string | null;
  generalConsiderations?: string | null;
  clientId?: number | null;
  clientName?: string | null;
  sourceTemplateId?: number | null;
  startDate?: Date | null;
  durationWeeks?: number | null;
  status?: RoutineStatus;
  sessions?: RoutineSession[];
  createdAt?: Date;
  updatedAt?: Date;
}

/** A reusable routine template or a client's assigned routine (see docs/data-model.md entity #5, US-005). */
export class RoutineTemplate {
  readonly id?: number;
  readonly name: string;
  readonly description: string | null;
  readonly objective: string | null;
  readonly generalConsiderations: string | null;
  readonly clientId: number | null;
  readonly clientName: string | null;
  readonly sourceTemplateId: number | null;
  readonly startDate: Date | null;
  readonly durationWeeks: number | null;
  readonly status: RoutineStatus;
  readonly sessions: RoutineSession[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: RoutineTemplateProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description ?? null;
    this.objective = props.objective ?? null;
    this.generalConsiderations = props.generalConsiderations ?? null;
    this.clientId = props.clientId ?? null;
    this.clientName = props.clientName ?? null;
    this.sourceTemplateId = props.sourceTemplateId ?? null;
    this.startDate = props.startDate ?? null;
    this.durationWeeks = props.durationWeeks ?? null;
    this.status = props.status ?? 'draft';
    this.sessions = props.sessions ?? [];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /** A library template is one not attached to a client. */
  isLibraryTemplate(): boolean {
    return this.clientId === null;
  }

  /** End date of a client-assigned routine, computed from startDate + durationWeeks. */
  get endDate(): Date | null {
    if (!this.startDate || !this.durationWeeks) {
      return null;
    }
    const end = new Date(this.startDate);
    end.setDate(end.getDate() + this.durationWeeks * 7);
    return end;
  }

  /** Whether the assigned routine's computed end date has passed. */
  isExpired(now: Date = new Date()): boolean {
    const end = this.endDate;
    return end !== null && now.getTime() > end.getTime();
  }
}
