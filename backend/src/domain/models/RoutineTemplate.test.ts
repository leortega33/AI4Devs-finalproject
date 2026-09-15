import { RoutineTemplate } from './RoutineTemplate';
import { RoutineSession } from './RoutineSession';
import { RoutineExerciseEntry } from './RoutineExerciseEntry';

describe('RoutineExerciseEntry', () => {
  it('should default optional fields to null', () => {
    const entry = new RoutineExerciseEntry({ exerciseId: 1, phase: 'main', order: 0 });

    expect(entry.block).toBeNull();
    expect(entry.kg).toBeNull();
    expect(entry.reps).toBeNull();
    expect(entry.series).toBeNull();
    expect(entry.notes).toBeNull();
  });

  it('should keep the provided prescription', () => {
    const entry = new RoutineExerciseEntry({
      exerciseId: 5,
      phase: 'main',
      block: 'Bloque 1',
      kg: 60,
      reps: 8,
      series: 4,
      order: 1,
    });

    expect(entry.kg).toBe(60);
    expect(entry.series).toBe(4);
    expect(entry.block).toBe('Bloque 1');
  });
});

describe('RoutineSession', () => {
  it('should default entries to an empty array', () => {
    const session = new RoutineSession({ name: 'Sesión A', order: 0 });

    expect(session.entries).toEqual([]);
    expect(session.warmupPrescription).toBeNull();
  });
});

describe('RoutineTemplate', () => {
  it('should default status to draft, clientId to null, and sessions to empty', () => {
    const template = new RoutineTemplate({ name: 'Hipertrofia' });

    expect(template.status).toBe('draft');
    expect(template.clientId).toBeNull();
    expect(template.sessions).toEqual([]);
    expect(template.isLibraryTemplate()).toBe(true);
  });

  it('should report a client-assigned routine as not a library template', () => {
    const template = new RoutineTemplate({ name: 'Rutina cliente', clientId: 3 });

    expect(template.isLibraryTemplate()).toBe(false);
  });

  it('should hold nested sessions and entries', () => {
    const template = new RoutineTemplate({
      name: 'Full body',
      sessions: [
        new RoutineSession({
          name: 'Sesión A',
          order: 0,
          entries: [new RoutineExerciseEntry({ exerciseId: 1, phase: 'warmup', order: 0 })],
        }),
      ],
    });

    expect(template.sessions).toHaveLength(1);
    expect(template.sessions[0].entries[0].phase).toBe('warmup');
  });
});
