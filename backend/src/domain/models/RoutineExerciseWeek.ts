export interface RoutineExerciseWeekProps {
  id?: number;
  week: number;
  kg?: number | null;
  reps?: number | null;
  series?: number | null;
}

/** One week of a routine entry's progression (US-018). */
export class RoutineExerciseWeek {
  readonly id?: number;
  readonly week: number;
  readonly kg: number | null;
  readonly reps: number | null;
  readonly series: number | null;

  constructor(props: RoutineExerciseWeekProps) {
    this.id = props.id;
    this.week = props.week;
    this.kg = props.kg ?? null;
    this.reps = props.reps ?? null;
    this.series = props.series ?? null;
  }
}
