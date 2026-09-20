import { RoutineExerciseWeek } from './RoutineExerciseWeek';

export type RoutinePhase = 'warmup' | 'main';

export interface RoutineExerciseEntryProps {
  id?: number;
  exerciseId: number;
  exerciseName?: string;
  exerciseVideoUrl?: string | null;
  phase: RoutinePhase;
  block?: string | null;
  kg?: number | null;
  reps?: number | null;
  series?: number | null;
  notes?: string | null;
  order: number;
  weeks?: RoutineExerciseWeek[];
}

/** A single exercise entry within a routine session (see docs/data-model.md entity #7, US-005). */
export class RoutineExerciseEntry {
  readonly id?: number;
  readonly exerciseId: number;
  readonly exerciseName?: string;
  readonly exerciseVideoUrl: string | null;
  readonly phase: RoutinePhase;
  readonly block: string | null;
  readonly kg: number | null;
  readonly reps: number | null;
  readonly series: number | null;
  readonly notes: string | null;
  readonly order: number;
  readonly weeks: RoutineExerciseWeek[];

  constructor(props: RoutineExerciseEntryProps) {
    this.id = props.id;
    this.exerciseId = props.exerciseId;
    this.exerciseName = props.exerciseName;
    this.exerciseVideoUrl = props.exerciseVideoUrl ?? null;
    this.phase = props.phase;
    this.block = props.block ?? null;
    this.kg = props.kg ?? null;
    this.reps = props.reps ?? null;
    this.series = props.series ?? null;
    this.notes = props.notes ?? null;
    this.order = props.order;
    this.weeks = props.weeks ?? [];
  }
}
