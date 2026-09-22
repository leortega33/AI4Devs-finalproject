import { buildRoutineExportModel } from './routineExportModel';
import { RoutineTemplate } from '../../domain/models/RoutineTemplate';
import { RoutineSession } from '../../domain/models/RoutineSession';
import { RoutineExerciseEntry } from '../../domain/models/RoutineExerciseEntry';
import { RoutineExerciseWeek } from '../../domain/models/RoutineExerciseWeek';
import { ExerciseCategory } from '../../domain/models/Exercise';

let orderCounter = 0;

function entry(
  name: string,
  phase: 'warmup' | 'main',
  opts: {
    category?: ExerciseCategory;
    block?: string | null;
    kg?: number | null;
    reps?: number | null;
    series?: number | null;
    notes?: string | null;
    weeks?: { week: number; kg?: number; reps?: number; series?: number }[];
  } = {},
): RoutineExerciseEntry {
  return new RoutineExerciseEntry({
    exerciseId: 1,
    exerciseName: name,
    exerciseCategory: opts.category,
    phase,
    block: opts.block ?? null,
    kg: opts.kg ?? null,
    reps: opts.reps ?? null,
    series: opts.series ?? null,
    notes: opts.notes ?? null,
    order: orderCounter++,
    weeks: (opts.weeks ?? []).map((w) => new RoutineExerciseWeek(w)),
  });
}

function routine(entries: RoutineExerciseEntry[], durationWeeks: number | null = 4): RoutineTemplate {
  return new RoutineTemplate({
    name: 'Full body',
    generalConsiderations: 'RIR 2',
    startDate: new Date('2026-08-10'),
    durationWeeks,
    sessions: [new RoutineSession({ name: 'A', warmupPrescription: '2 VUELTAS 8 REPS', order: 0, entries })],
  });
}

describe('buildRoutineExportModel', () => {
  beforeEach(() => {
    orderCounter = 0;
  });

  it('splits warm-up entries into mobility and activation', () => {
    const model = buildRoutineExportModel(
      routine([
        entry('Dorsiflexión', 'warmup', { category: 'mobility' }),
        entry('Bicho muerto', 'warmup', { category: 'activation' }),
      ]),
    );
    const session = model.sessions[0];
    expect(session.mobility).toEqual(['Dorsiflexión']);
    expect(session.activation).toEqual(['Bicho muerto']);
  });

  it('groups consecutive main entries by block and shares the series per week', () => {
    const model = buildRoutineExportModel(
      routine([
        entry('Sentadilla', 'main', { block: 'A', series: 3, weeks: [{ week: 1, kg: 5, reps: 8, series: 3 }] }),
        entry('Cuádriceps', 'main', { block: 'A', weeks: [{ week: 1, kg: 20, reps: 12 }] }),
        entry('Press militar', 'main', { block: 'B', series: 3, weeks: [{ week: 1, reps: 10, series: 3 }] }),
      ]),
    );
    const blocks = model.sessions[0].blocks;
    expect(blocks).toHaveLength(2);
    expect(blocks[0].rows.map((r) => r.exercise)).toEqual(['Sentadilla', 'Cuádriceps']);
    expect(blocks[0].seriesByWeek[0]).toBe(3);
    expect(blocks[1].rows.map((r) => r.exercise)).toEqual(['Press militar']);
  });

  it('falls back to base values in week 1 when an entry has no weeks', () => {
    const model = buildRoutineExportModel(routine([entry('Prensa', 'main', { block: 'A', kg: 50, reps: 12, series: 4 })]));
    const row = model.sessions[0].blocks[0].rows[0];
    expect(row.perWeek[0]).toEqual({ kg: 50, reps: 12, series: 4 });
    expect(row.perWeek[1]).toEqual({ kg: null, reps: null, series: null });
  });

  it('detects the final block and omits it from the main blocks', () => {
    const model = buildRoutineExportModel(
      routine([
        entry('Sentadilla', 'main', { block: 'A', series: 3 }),
        entry('Plancha', 'main', { block: 'Bloque Final', reps: 30, notes: 'iso' }),
      ]),
    );
    const session = model.sessions[0];
    expect(session.blocks).toHaveLength(1);
    expect(session.finalBlock).toEqual([
      { exercise: 'Plancha', kg: null, reps: 30, series: null, notes: 'iso' },
    ]);
  });

  it('has no final block when none is labelled final', () => {
    const model = buildRoutineExportModel(routine([entry('Sentadilla', 'main', { block: 'A' })]));
    expect(model.sessions[0].finalBlock).toEqual([]);
  });

  it('clamps the week count from durationWeeks', () => {
    expect(buildRoutineExportModel(routine([], 4)).weekCount).toBe(4);
    expect(buildRoutineExportModel(routine([], null)).weekCount).toBe(1);
    expect(buildRoutineExportModel(routine([], 99)).weekCount).toBe(8);
  });

  it('derives the week count from entry weeks when durationWeeks is absent (library template)', () => {
    const model = buildRoutineExportModel(
      routine(
        [
          entry('Sentadilla', 'main', {
            block: 'A',
            weeks: [{ week: 1, reps: 8 }, { week: 2, reps: 10 }, { week: 3, reps: 12 }, { week: 4, reps: 15 }],
          }),
        ],
        null,
      ),
    );
    expect(model.weekCount).toBe(4);
    expect(model.sessions[0].blocks[0].rows[0].perWeek).toHaveLength(4);
  });

  it('strips a redundant "Sesión/Sesion" prefix from the session name', () => {
    const withPrefix = new RoutineTemplate({
      name: 'R',
      sessions: [
        new RoutineSession({ name: 'Sesion A', order: 0, entries: [] }),
        new RoutineSession({ name: 'Sesión B', order: 1, entries: [] }),
        new RoutineSession({ name: 'Piernas', order: 2, entries: [] }),
      ],
    });
    const names = buildRoutineExportModel(withPrefix).sessions.map((s) => s.name);
    expect(names).toEqual(['A', 'B', 'Piernas']);
  });

  it('carries the header data (routine, client, start date, considerations)', () => {
    const model = buildRoutineExportModel(routine([]), 'Ortega, Leonel');
    expect(model.routineName).toBe('Full body');
    expect(model.clientName).toBe('Ortega, Leonel');
    expect(model.startDate).toEqual(new Date('2026-08-10'));
    expect(model.considerations).toBe('RIR 2');
  });
});
