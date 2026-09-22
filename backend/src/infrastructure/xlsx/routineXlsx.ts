import ExcelJS from 'exceljs';
import { RoutineTemplate } from '../../domain/models/RoutineTemplate';
import { buildRoutineExportModel, ExportSession } from '../export/routineExportModel';

export type XlsxLang = 'es' | 'en';

const BRAND = {
  name: 'SPORT – FITNESS',
  tagline: 'ENTRENAMIENTO FÍSICO INTEGRAL',
  trainer: 'PF: MANSILLA LEANDRO',
  phone: 'CEL: 2604300402',
};

// ARGB colors sampled from the reference plan (planning/reference/trainer-plan.pdf).
const ARGB = {
  black: 'FF000000',
  white: 'FFFFFFFF',
  sessionBar: 'FFC5DFB4',
  accent: 'FF6FAC46',
};

interface Labels {
  routine: string;
  plan: string;
  client: string;
  startDate: string;
  session: string;
  weekOf: string;
  week: string;
  preparation: string;
  mobility: string;
  activation: string;
  exercises: string;
  kg: string;
  reps: string;
  series: string;
  finalBlock: string;
  observations: string;
  considerations: string;
}

const LABELS: Record<XlsxLang, Labels> = {
  es: {
    routine: 'Rutina',
    plan: 'PLAN DE ENTRENAMIENTO',
    client: 'Apellido y Nombre',
    startDate: 'Fecha de inicio',
    session: 'SESIÓN',
    weekOf: 'SEMANA DE TRABAJO',
    week: 'SEMANA',
    preparation: 'PREPARACIÓN PARA EL MOVIMIENTO',
    mobility: 'MOVILIDAD',
    activation: 'ACTIVACIÓN',
    exercises: 'EJERCICIOS',
    kg: 'KG',
    reps: 'REPS',
    series: 'SERIES',
    finalBlock: 'EJERCICIOS BLOQUE FINAL',
    observations: 'OBSERVACIONES',
    considerations: 'CONSIDERACIONES A TENER EN CUENTA',
  },
  en: {
    routine: 'Routine',
    plan: 'TRAINING PLAN',
    client: 'Name',
    startDate: 'Start date',
    session: 'SESSION',
    weekOf: 'TRAINING WEEK',
    week: 'WEEK',
    preparation: 'MOVEMENT PREPARATION',
    mobility: 'MOBILITY',
    activation: 'ACTIVATION',
    exercises: 'EXERCISES',
    kg: 'KG',
    reps: 'REPS',
    series: 'SETS',
    finalBlock: 'FINAL BLOCK EXERCISES',
    observations: 'NOTES',
    considerations: 'THINGS TO KEEP IN MIND',
  },
};

function resolveLabels(lang: XlsxLang): Labels {
  return LABELS[lang] ?? LABELS.es;
}

// Excel worksheet names are <=31 chars and cannot contain [ ] : * ? / \.
function sanitizeSheetName(name: string, used: Set<string>): string {
  const base = name.replace(/[[\]:*?/\\]/g, ' ').trim().slice(0, 28) || 'Hoja';
  let candidate = base;
  let n = 2;
  while (used.has(candidate.toLowerCase())) {
    candidate = `${base.slice(0, 25)} (${n})`;
    n += 1;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

function fmtDate(date: Date | null): string {
  if (!date) return '—';
  return date.toISOString().slice(0, 10).split('-').reverse().join('/');
}

function solid(argb: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

const CENTER: Partial<ExcelJS.Alignment> = { horizontal: 'center', vertical: 'middle' };
const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
  left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
  bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
  right: { style: 'thin', color: { argb: 'FFBFBFBF' } },
};

/** Renders one session as a worksheet matching the plan layout. */
function renderSession(
  sheet: ExcelJS.Worksheet,
  labels: Labels,
  session: ExportSession,
  header: { clientName: string | null; startDate: string },
): void {
  const weekCount = session.weekCount;
  const lastCol = 1 + weekCount * 3;
  const kgCol = (w: number) => 2 + w * 3;
  const seriesCol = (w: number) => 4 + w * 3;
  sheet.getColumn(1).width = 34;
  for (let c = 2; c <= lastCol; c += 1) sheet.getColumn(c).width = 7;

  let r = 1;
  const mergeFullRow = (row: number) => sheet.mergeCells(row, 1, row, lastCol);

  // Brand band.
  mergeFullRow(r);
  const brand = sheet.getCell(r, 1);
  brand.value = `${BRAND.name}  ·  ${BRAND.tagline}`;
  brand.fill = solid(ARGB.black);
  brand.font = { bold: true, size: 14, color: { argb: ARGB.white } };
  brand.alignment = CENTER;
  sheet.getRow(r).height = 22;
  r += 1;
  mergeFullRow(r);
  const sub = sheet.getCell(r, 1);
  sub.value = `${BRAND.trainer}   ·   ${BRAND.phone}`;
  sub.font = { italic: true, size: 9 };
  sub.alignment = CENTER;
  r += 2;

  // Plan title + client/date.
  mergeFullRow(r);
  const title = sheet.getCell(r, 1);
  title.value = labels.plan;
  title.font = { bold: true, italic: true, size: 13 };
  title.alignment = CENTER;
  r += 1;
  sheet.getCell(r, 1).value = `${labels.client}: ${header.clientName ?? '—'}`;
  r += 1;
  sheet.getCell(r, 1).value = `${labels.startDate}: ${header.startDate}`;
  r += 2;

  // Session bar.
  mergeFullRow(r);
  const bar = sheet.getCell(r, 1);
  bar.value = `${labels.session} ${session.name}`;
  bar.fill = solid(ARGB.sessionBar);
  bar.font = { bold: true, size: 12 };
  bar.alignment = CENTER;
  r += 1;

  // Week header.
  sheet.getCell(r, 1).value = labels.weekOf;
  sheet.getCell(r, 1).font = { bold: true };
  for (let w = 0; w < weekCount; w += 1) {
    sheet.mergeCells(r, kgCol(w), r, kgCol(w) + 2);
    const cell = sheet.getCell(r, kgCol(w));
    cell.value = `${labels.week} ${w + 1}`;
    cell.font = { bold: true };
    cell.alignment = CENTER;
    cell.border = THIN_BORDER;
  }
  r += 1;

  // Preparation + prescription.
  mergeFullRow(r);
  const prep = sheet.getCell(r, 1);
  prep.value = session.warmupPrescription
    ? `${labels.preparation} — ${session.warmupPrescription}`
    : labels.preparation;
  prep.font = { bold: true };
  prep.alignment = CENTER;
  r += 1;

  // Mobility / activation two columns.
  const half = Math.ceil((lastCol - 1) / 2);
  sheet.mergeCells(r, 1, r, half);
  sheet.mergeCells(r, half + 1, r, lastCol);
  sheet.getCell(r, 1).value = labels.mobility;
  sheet.getCell(r, half + 1).value = labels.activation;
  sheet.getCell(r, 1).font = { bold: true };
  sheet.getCell(r, half + 1).font = { bold: true };
  sheet.getCell(r, 1).alignment = CENTER;
  sheet.getCell(r, half + 1).alignment = CENTER;
  r += 1;
  const warmupRows = Math.max(session.mobility.length, session.activation.length, 1);
  for (let i = 0; i < warmupRows; i += 1) {
    sheet.mergeCells(r, 1, r, half);
    sheet.mergeCells(r, half + 1, r, lastCol);
    if (session.mobility[i]) sheet.getCell(r, 1).value = `${i + 1}- ${session.mobility[i]}`;
    if (session.activation[i]) sheet.getCell(r, half + 1).value = `${i + 1}- ${session.activation[i]}`;
    r += 1;
  }

  // Exercises header.
  const exCell = sheet.getCell(r, 1);
  exCell.value = labels.exercises;
  exCell.fill = solid(ARGB.black);
  exCell.font = { bold: true, color: { argb: ARGB.white } };
  for (let w = 0; w < weekCount; w += 1) {
    (['kg', 'reps', 'series'] as const).forEach((key, i) => {
      const cell = sheet.getCell(r, kgCol(w) + i);
      cell.value = labels[key];
      cell.fill = solid(ARGB.black);
      cell.font = { bold: true, color: { argb: ARGB.white } };
      cell.alignment = CENTER;
    });
  }
  r += 1;

  // Blocks.
  session.blocks.forEach((block) => {
    const blockTop = r;
    block.rows.forEach((row) => {
      sheet.getCell(r, 1).value = row.exercise;
      sheet.getCell(r, 1).border = THIN_BORDER;
      for (let w = 0; w < weekCount; w += 1) {
        const cell = row.perWeek[w];
        const kg = sheet.getCell(r, kgCol(w));
        const reps = sheet.getCell(r, kgCol(w) + 1);
        kg.value = cell.kg ?? '';
        reps.value = cell.reps ?? '';
        kg.alignment = CENTER;
        reps.alignment = CENTER;
        kg.border = THIN_BORDER;
        reps.border = THIN_BORDER;
      }
      r += 1;
    });
    const blockBottom = r - 1;
    // Merge the shared SERIES per week across the block's rows.
    for (let w = 0; w < weekCount; w += 1) {
      if (blockBottom > blockTop) sheet.mergeCells(blockTop, seriesCol(w), blockBottom, seriesCol(w));
      const cell = sheet.getCell(blockTop, seriesCol(w));
      cell.value = block.seriesByWeek[w] ?? '';
      cell.font = { bold: true };
      cell.alignment = CENTER;
      cell.border = THIN_BORDER;
    }
    r += 1; // blank separator row between blocks
  });

  // Final block.
  if (session.finalBlock.length > 0) {
    const headers = [labels.finalBlock, labels.kg, labels.reps, labels.series, labels.observations];
    headers.forEach((value, i) => {
      const cell = sheet.getCell(r, 1 + i);
      cell.value = value;
      cell.fill = solid(ARGB.black);
      cell.font = { bold: true, color: { argb: ARGB.white } };
      if (i !== 0) cell.alignment = CENTER;
    });
    r += 1;
    session.finalBlock.forEach((row, i) => {
      sheet.getCell(r, 1).value = `${i + 1}- ${row.exercise}`;
      sheet.getCell(r, 2).value = row.kg ?? '';
      sheet.getCell(r, 3).value = row.reps ?? '';
      sheet.getCell(r, 4).value = row.series ?? '';
      sheet.getCell(r, 5).value = row.notes ?? '';
      [2, 3, 4].forEach((c) => (sheet.getCell(r, c).alignment = CENTER));
      r += 1;
    });
  }
}

/**
 * Builds a routine spreadsheet matching the trainer's plan format (US-030): one
 * worksheet per session plus a considerations sheet. Returns the workbook Buffer.
 */
export async function buildRoutineXlsx(
  routine: RoutineTemplate,
  lang: XlsxLang = 'es',
  clientName: string | null = null,
): Promise<Buffer> {
  const labels = resolveLabels(lang);
  const model = buildRoutineExportModel(routine, clientName);
  const workbook = new ExcelJS.Workbook();
  const usedNames = new Set<string>();

  if (model.sessions.length === 0) {
    workbook.addWorksheet(labels.routine);
  }

  model.sessions.forEach((session) => {
    const sheet = workbook.addWorksheet(sanitizeSheetName(session.name, usedNames));
    renderSession(sheet, labels, session, { clientName: model.clientName, startDate: fmtDate(model.startDate) });
  });

  if (model.considerations) {
    const sheet = workbook.addWorksheet(sanitizeSheetName(labels.considerations.slice(0, 20), usedNames));
    sheet.getColumn(1).width = 100;
    const head = sheet.getCell(1, 1);
    head.value = labels.considerations;
    head.font = { bold: true, size: 12 };
    model.considerations.split('\n').forEach((line, i) => {
      sheet.getCell(3 + i, 1).value = line;
    });
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
