import { Exercise } from '../../domain/models/Exercise';
import { RegionCode } from '../../domain/models/bodyRegions';
import { ExerciseRepository } from '../../domain/repositories/ExerciseRepository';
import { MedicalFlagsService } from './medicalFlagsService';

/** Warm-up exercises suggested for a single flagged body region (US-023). */
export interface WarmupSuggestionGroup {
  region: RegionCode;
  exercises: Exercise[];
}

export interface WarmupSuggestions {
  regions: RegionCode[];
  suggestions: WarmupSuggestionGroup[];
}

/** Warm-up-eligible categories: preparation work, not the main load. */
const WARMUP_CATEGORIES = ['mobility', 'activation'] as const;

/**
 * Suggests warm-up (mobility/activation) exercises for the body regions a
 * client's medical record flags, grouped by region. Advisory guidance only
 * (US-023); reuses the US-022 flags + exercise `bodyRegions` tags.
 */
export class WarmupSuggestionService {
  constructor(
    private readonly medicalFlagsService: MedicalFlagsService,
    private readonly exerciseRepository: ExerciseRepository,
  ) {}

  async getSuggestions(clientId: number): Promise<WarmupSuggestions> {
    // Enforces client-exists (404) and derives the flagged regions.
    const { regions } = await this.medicalFlagsService.getFlags(clientId);
    if (regions.length === 0) {
      return { regions: [], suggestions: [] };
    }

    const warmupExercises: Exercise[] = [];
    for (const category of WARMUP_CATEGORIES) {
      warmupExercises.push(...(await this.exerciseRepository.findAll({ category })));
    }

    const suggestions: WarmupSuggestionGroup[] = [];
    for (const region of regions) {
      const exercises = warmupExercises.filter((exercise) =>
        exercise.bodyRegions.includes(region),
      );
      if (exercises.length > 0) {
        suggestions.push({ region, exercises });
      }
    }

    return { regions, suggestions };
  }
}
