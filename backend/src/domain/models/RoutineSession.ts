import { RoutineExerciseEntry } from './RoutineExerciseEntry';

export interface RoutineSessionProps {
  id?: number;
  name: string;
  warmupPrescription?: string | null;
  order: number;
  entries?: RoutineExerciseEntry[];
}

/** A single workout day within a routine (see docs/data-model.md entity #6, US-005). */
export class RoutineSession {
  readonly id?: number;
  readonly name: string;
  readonly warmupPrescription: string | null;
  readonly order: number;
  readonly entries: RoutineExerciseEntry[];

  constructor(props: RoutineSessionProps) {
    this.id = props.id;
    this.name = props.name;
    this.warmupPrescription = props.warmupPrescription ?? null;
    this.order = props.order;
    this.entries = props.entries ?? [];
  }
}
