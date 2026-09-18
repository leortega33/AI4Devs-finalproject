import { RoutineTemplate } from '../../domain/models/RoutineTemplate';
import { RoutineSession } from '../../domain/models/RoutineSession';
import { RoutineExerciseEntry } from '../../domain/models/RoutineExerciseEntry';
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
    sessions: [
      new RoutineSession({
        name: 'Sesión A',
        warmupPrescription: '5 min de bici',
        order: 0,
        entries: [
          new RoutineExerciseEntry({ exerciseId: 1, exerciseName: 'Movilidad de cadera', phase: 'warmup', order: 0 }),
          new RoutineExerciseEntry({ exerciseId: 2, exerciseName: 'Sentadilla', phase: 'main', kg: 60, reps: 8, series: 4, notes: 'Controlar la bajada', order: 1 }),
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

  it('respects the language argument without throwing', async () => {
    const en = await renderToBuffer(buildRoutinePdf(makeRoutine(), 'en'));
    const es = await renderToBuffer(buildRoutinePdf(makeRoutine(), 'es'));
    expect(en.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(es.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });
});
