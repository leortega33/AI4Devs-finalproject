import { RoutineExerciseEntry } from './RoutineExerciseEntry';

describe('RoutineExerciseEntry', () => {
  it('exposes the exercise category and defaults it to null', () => {
    const withCategory = new RoutineExerciseEntry({
      exerciseId: 1,
      phase: 'warmup',
      order: 0,
      exerciseCategory: 'mobility',
    });
    expect(withCategory.exerciseCategory).toBe('mobility');

    const withoutCategory = new RoutineExerciseEntry({ exerciseId: 2, phase: 'main', order: 1 });
    expect(withoutCategory.exerciseCategory).toBeNull();
  });
});
