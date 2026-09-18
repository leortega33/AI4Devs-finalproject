import ExcelJS from 'exceljs';
import { RoutineTemplate } from '../../domain/models/RoutineTemplate';

export type XlsxLang = 'es' | 'en';

interface Labels {
  phase: string;
  block: string;
  exercise: string;
  kg: string;
  reps: string;
  series: string;
  notes: string;
  warmup: string;
  main: string;
  routine: string;
}

const LABELS: Record<XlsxLang, Labels> = {
  es: {
    phase: 'Fase',
    block: 'Bloque',
    exercise: 'Ejercicio',
    kg: 'kg',
    reps: 'Reps',
    series: 'Series',
    notes: 'Notas',
    warmup: 'Entrada en calor',
    main: 'Principal',
    routine: 'Rutina',
  },
  en: {
    phase: 'Phase',
    block: 'Block',
    exercise: 'Exercise',
    kg: 'kg',
    reps: 'Reps',
    series: 'Sets',
    notes: 'Notes',
    warmup: 'Warm-up',
    main: 'Main',
    routine: 'Routine',
  },
};

function resolveLabels(lang: XlsxLang): Labels {
  return LABELS[lang] ?? LABELS.es;
}

// Excel worksheet names are <=31 chars and cannot contain [ ] : * ? / \.
function sanitizeSheetName(name: string, used: Set<string>): string {
  let base = name.replace(/[[\]:*?/\\]/g, ' ').trim().slice(0, 28) || 'Hoja';
  let candidate = base;
  let n = 2;
  while (used.has(candidate.toLowerCase())) {
    candidate = `${base.slice(0, 25)} (${n})`;
    n += 1;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

/**
 * Builds a routine spreadsheet (US-017): one worksheet per session, with a header
 * row and one row per exercise entry. Returns the workbook as a Buffer.
 */
export async function buildRoutineXlsx(routine: RoutineTemplate, lang: XlsxLang = 'es'): Promise<Buffer> {
  const labels = resolveLabels(lang);
  const workbook = new ExcelJS.Workbook();
  const phaseLabel: Record<'warmup' | 'main', string> = { warmup: labels.warmup, main: labels.main };

  const sessions = [...routine.sessions].sort((a, b) => a.order - b.order);
  const usedNames = new Set<string>();

  if (sessions.length === 0) {
    // Keep the workbook valid even when the routine has no sessions.
    workbook.addWorksheet(labels.routine);
  }

  sessions.forEach((session) => {
    const sheet = workbook.addWorksheet(sanitizeSheetName(session.name, usedNames));
    sheet.addRow([labels.phase, labels.block, labels.exercise, labels.kg, labels.reps, labels.series, labels.notes]);
    sheet.getRow(1).font = { bold: true };

    [...session.entries]
      .sort((a, b) => a.order - b.order)
      .forEach((entry) => {
        sheet.addRow([
          phaseLabel[entry.phase],
          entry.block ?? '',
          entry.exerciseName ?? `#${entry.exerciseId}`,
          entry.kg ?? '',
          entry.reps ?? '',
          entry.series ?? '',
          entry.notes ?? '',
        ]);
      });
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
