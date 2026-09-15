import { Exercise } from './Exercise';

describe('Exercise', () => {
  const baseProps = {
    name: 'Back squat',
    muscleGroup: 'Legs',
    category: 'main' as const,
  };

  it('should default optional fields to null', () => {
    const exercise = new Exercise(baseProps);

    expect(exercise.defaultSets).toBeNull();
    expect(exercise.defaultReps).toBeNull();
    expect(exercise.technique).toBeNull();
    expect(exercise.equipment).toBeNull();
  });

  it('should keep the provided values', () => {
    const exercise = new Exercise({
      ...baseProps,
      id: 3,
      defaultSets: 4,
      defaultReps: 8,
      technique: 'Keep the bar over midfoot',
      equipment: 'Barbell',
    });

    expect(exercise.id).toBe(3);
    expect(exercise.category).toBe('main');
    expect(exercise.defaultSets).toBe(4);
    expect(exercise.equipment).toBe('Barbell');
  });
});
