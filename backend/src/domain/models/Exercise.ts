import { RegionCode } from './bodyRegions';

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
  videoUrl?: string | null;
  imageUrl?: string | null;
  bodyRegions?: RegionCode[];
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
  readonly videoUrl: string | null;
  readonly imageUrl: string | null;
  readonly bodyRegions: RegionCode[];
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
    this.videoUrl = props.videoUrl ?? null;
    this.imageUrl = props.imageUrl ?? null;
    this.bodyRegions = props.bodyRegions ?? [];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
