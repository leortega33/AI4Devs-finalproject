import ExcelJS from 'exceljs';
import { RoutineTemplate } from '../../domain/models/RoutineTemplate';
import { RoutineSession } from '../../domain/models/RoutineSession';
import { RoutineExerciseEntry } from '../../domain/models/RoutineExerciseEntry';
import { RoutineExerciseWeek } from '../../domain/models/RoutineExerciseWeek';
import { buildRoutineXlsx } from './routineXlsx';

/** All string cell values in a worksheet, for membership assertions. */
function sheetTexts(sheet: ExcelJS.Worksheet): string[] {
  const texts: string[] = [];
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      if (typeof cell.value === 'string') texts.push(cell.value);
    });
  });
  return texts;
}

async function load(buffer: Buffer): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  return workbook;
}

function makeRoutine(): RoutineTemplate {
  return new RoutineTemplate({
    id: 1,
    name: 'Hipertrofia',
    durationWeeks: 4,
    generalConsiderations: 'Mantener RIR 2',
    sessions: [
      new RoutineSession({
        name: 'Sesión A',
        warmupPrescription: '2 VUELTAS 8 REPS',
        order: 0,
        entries: [
          new RoutineExerciseEntry({ exerciseId: 1, exerciseName: 'Dorsiflexión', exerciseCategory: 'mobility', phase: 'warmup', order: 0 }),
          new RoutineExerciseEntry({
            exerciseId: 2,
            exerciseName: 'Sentadilla',
            phase: 'main',
            block: 'A',
            order: 1,
            weeks: [new RoutineExerciseWeek({ week: 1, kg: 60, reps: 8, series: 4 })],
          }),
          new RoutineExerciseEntry({ exerciseId: 3, exerciseName: 'Plancha', phase: 'main', block: 'Bloque Final', reps: 30, order: 2 }),
        ],
      }),
      new RoutineSession({ name: 'Sesión B', order: 1, entries: [] }),
    ],
  });
}

describe('buildRoutineXlsx', () => {
  it('produces a non-empty xlsx with one sheet per session plus considerations', async () => {
    const buffer = await buildRoutineXlsx(makeRoutine());
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.subarray(0, 2).toString('latin1')).toBe('PK'); // XLSX = ZIP

    const workbook = await load(buffer);
    expect(workbook.worksheets.length).toBe(3); // 2 sessions + considerations

    const first = sheetTexts(workbook.worksheets[0]);
    expect(first.some((t) => t.includes('SPORT – FITNESS'))).toBe(true);
    expect(first).toContain('Sentadilla');
    expect(first).toContain('MOVILIDAD');
    expect(first).toContain('EJERCICIOS BLOQUE FINAL');
  });

  it('produces a valid workbook for a routine with no sessions', async () => {
    const empty = new RoutineTemplate({ id: 2, name: 'Vacía', sessions: [] });
    const buffer = await buildRoutineXlsx(empty);
    expect(buffer.subarray(0, 2).toString('latin1')).toBe('PK');

    const workbook = await load(buffer);
    expect(workbook.worksheets.length).toBeGreaterThanOrEqual(1);
  });

  it('respects the language argument (English labels)', async () => {
    const buffer = await buildRoutineXlsx(makeRoutine(), 'en');
    const workbook = await load(buffer);
    const first = sheetTexts(workbook.worksheets[0]);
    expect(first).toContain('EXERCISES');
    expect(first).toContain('MOBILITY');
  });
});
