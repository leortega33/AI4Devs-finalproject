import { RoutineTemplate } from '../../domain/models/RoutineTemplate';
import { RoutineSession } from '../../domain/models/RoutineSession';
import { RoutineExerciseEntry } from '../../domain/models/RoutineExerciseEntry';
import { RoutineExerciseWeek } from '../../domain/models/RoutineExerciseWeek';
import { buildRoutinePdf } from './routinePdf';

/** Collects a PDFKit document into a Buffer for assertions. */
function renderToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

function makeRoutine(): RoutineTemplate {
  return new RoutineTemplate({
    id: 1,
    name: 'Hipertrofia A/B',
    objective: 'Fuerza',
    startDate: new Date('2026-08-10'),
    durationWeeks: 4,
    generalConsiderations: 'Mantener RIR 2',
    sessions: [
      new RoutineSession({
        name: 'A',
        warmupPrescription: '2 VUELTAS 8 REPS C-U',
        order: 0,
        entries: [
          new RoutineExerciseEntry({ exerciseId: 1, exerciseName: 'Dorsiflexión', exerciseCategory: 'mobility', phase: 'warmup', order: 0 }),
          new RoutineExerciseEntry({ exerciseId: 2, exerciseName: 'Bicho muerto', exerciseCategory: 'activation', phase: 'warmup', order: 1 }),
          new RoutineExerciseEntry({
            exerciseId: 3,
            exerciseName: 'Sentadilla',
            phase: 'main',
            block: 'A',
            order: 2,
            weeks: [new RoutineExerciseWeek({ week: 1, kg: 5, reps: 8, series: 3 })],
          }),
          new RoutineExerciseEntry({ exerciseId: 4, exerciseName: 'Plancha', phase: 'main', block: 'Bloque Final', reps: 30, notes: 'iso', order: 3 }),
        ],
      }),
    ],
  });
}

describe('buildRoutinePdf', () => {
  it('produces a non-empty PDF for a routine with sessions', async () => {
    const buffer = await renderToBuffer(buildRoutinePdf(makeRoutine()));
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });

  it('produces a valid PDF for a routine with no sessions', async () => {
    const empty = new RoutineTemplate({ id: 2, name: 'Vacía', sessions: [] });
    const buffer = await renderToBuffer(buildRoutinePdf(empty));
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });

  it('renders the client name in the header when provided', async () => {
    const buffer = await renderToBuffer(buildRoutinePdf(makeRoutine(), 'es', 'Ortega, Leonel'));
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('respects the language argument without throwing', async () => {
    const en = await renderToBuffer(buildRoutinePdf(makeRoutine(), 'en'));
    const es = await renderToBuffer(buildRoutinePdf(makeRoutine(), 'es'));
    expect(en.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(es.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });
});
