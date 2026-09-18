import ExcelJS from 'exceljs';
import { RoutineTemplate } from '../../domain/models/RoutineTemplate';
import { RoutineSession } from '../../domain/models/RoutineSession';
import { RoutineExerciseEntry } from '../../domain/models/RoutineExerciseEntry';
import { buildRoutineXlsx } from './routineXlsx';

function makeRoutine(): RoutineTemplate {
  return new RoutineTemplate({
    id: 1,
    name: 'Hipertrofia',
    sessions: [
      new RoutineSession({
        name: 'Sesión A',
        order: 0,
        entries: [
          new RoutineExerciseEntry({ exerciseId: 1, exerciseName: 'Sentadilla', phase: 'main', kg: 60, reps: 8, series: 4, order: 0 }),
        ],
      }),
      new RoutineSession({ name: 'Sesión B', order: 1, entries: [] }),
    ],
  });
}

describe('buildRoutineXlsx', () => {
  it('produces a non-empty xlsx workbook with one sheet per session', async () => {
    const buffer = await buildRoutineXlsx(makeRoutine());
    expect(buffer.length).toBeGreaterThan(0);
    // XLSX files are ZIP archives (PK signature).
    expect(buffer.subarray(0, 2).toString('latin1')).toBe('PK');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    expect(workbook.worksheets).toHaveLength(2);
    expect(workbook.worksheets[0].getRow(2).getCell(3).value).toBe('Sentadilla');
  });

  it('produces a valid workbook for a routine with no sessions', async () => {
    const empty = new RoutineTemplate({ id: 2, name: 'Vacía', sessions: [] });
    const buffer = await buildRoutineXlsx(empty);
    expect(buffer.subarray(0, 2).toString('latin1')).toBe('PK');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    expect(workbook.worksheets.length).toBeGreaterThanOrEqual(1);
  });

  it('respects the language argument (English headers)', async () => {
    const buffer = await buildRoutineXlsx(makeRoutine(), 'en');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    expect(workbook.worksheets[0].getRow(1).getCell(1).value).toBe('Phase');
  });
});
