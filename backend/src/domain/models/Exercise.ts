export type ExerciseCategory = 'mobility' | 'activation' | 'main';

export interface ExerciseProps {
  id?: number;
  name: string;
  muscleGroup: string;
  category: ExerciseCategory;
  defaultSets?: number | null;
  defaultReps?: number | null;
  technique?: string | null;
  equipment?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Reusable exercise catalog entry (see docs/data-model.md entity #4, US-004). */
export class Exercise {
  readonly id?: number;
  readonly name: string;
  readonly muscleGroup: string;
  readonly category: ExerciseCategory;
  readonly defaultSets: number | null;
  readonly defaultReps: number | null;
  readonly technique: string | null;
  readonly equipment: string | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: ExerciseProps) {
    this.id = props.id;
    this.name = props.name;
    this.muscleGroup = props.muscleGroup;
    this.category = props.category;
    this.defaultSets = props.defaultSets ?? null;
    this.defaultReps = props.defaultReps ?? null;
    this.technique = props.technique ?? null;
    this.equipment = props.equipment ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
