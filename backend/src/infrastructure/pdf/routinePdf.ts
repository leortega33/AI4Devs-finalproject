import path from 'path';
import PDFDocument from 'pdfkit';
import { RoutineTemplate } from '../../domain/models/RoutineTemplate';
import {
  buildRoutineExportModel,
  ExportSession,
  ExportBlock,
  CellPrescription,
} from '../export/routineExportModel';

export type PdfLang = 'es' | 'en';

const LOGO_PATH = path.join(__dirname, 'assets', 'logo.png');

// Brand constants (static, identical in every language — proper nouns).
const BRAND = {
  trainer: 'PF: MANSILLA LEANDRO',
  name: 'SPORT – FITNESS',
  tagline: 'ENTRENAMIENTO FÍSICO INTEGRAL',
  phone: 'CEL: 2604300402',
};

// Colors sampled from the reference plan (planning/reference/trainer-plan.pdf).
const COLOR = {
  black: '#000000',
  white: '#FFFFFF',
  sessionBar: '#C5DFB4',
  accent: '#6FAC46',
  rowBorder: '#BFBFBF',
};

interface Labels {
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
  empty: string;
}

const LABELS: Record<PdfLang, Labels> = {
  es: {
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
    empty: 'Esta rutina no tiene sesiones cargadas.',
  },
  en: {
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
    empty: 'This routine has no sessions.',
  },
};

const PAGE = { width: 842, height: 595, margin: 30 };
const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;
const BAND_HEIGHT = 46;
const CONTENT_TOP = PAGE.margin + BAND_HEIGHT + 10;

function resolveLabels(lang: PdfLang): Labels {
  return LABELS[lang] ?? LABELS.es;
}

function fmtDate(date: Date | null): string {
  if (!date) return '—';
  return date.toISOString().slice(0, 10).split('-').reverse().join('/');
}

function cellText(value: number | null): string {
  return value == null ? '' : String(value);
}

/** Draws the black brand band at the top of the current page. */
function drawBrandBand(doc: PDFKit.PDFDocument): void {
  const x = PAGE.margin;
  const y = PAGE.margin;
  doc.save();
  doc.rect(x, y, CONTENT_WIDTH, BAND_HEIGHT).fill(COLOR.black);
  doc.fillColor(COLOR.white).font('Helvetica-BoldOblique').fontSize(8);
  doc.text(BRAND.trainer, x + 8, y + BAND_HEIGHT / 2 - 4, { width: 160 });
  doc.font('Helvetica-Bold').fontSize(18);
  doc.text(BRAND.name, x, y + 6, { width: CONTENT_WIDTH, align: 'center' });
  doc.fillColor(COLOR.accent).font('Helvetica-Bold').fontSize(9);
  doc.text(BRAND.tagline, x, y + 28, { width: CONTENT_WIDTH, align: 'center' });
  doc.fillColor(COLOR.white).font('Helvetica-BoldOblique').fontSize(8);
  doc.text(BRAND.phone, x + CONTENT_WIDTH - 168, y + BAND_HEIGHT / 2 - 4, { width: 160, align: 'right' });
  doc.restore();
}

/** Ensures there is room for `needed` points below the cursor, adding a page if not. */
function ensureSpace(doc: PDFKit.PDFDocument, needed: number): void {
  if (doc.y + needed > PAGE.height - PAGE.margin) {
    doc.addPage();
  }
}

function drawSessionBar(doc: PDFKit.PDFDocument, labels: Labels, session: ExportSession): void {
  ensureSpace(doc, 60);
  const x = PAGE.margin;
  const y = doc.y;
  doc.save();
  doc.rect(x, y, CONTENT_WIDTH, 16).fill(COLOR.sessionBar);
  doc.fillColor(COLOR.black).font('Helvetica-Bold').fontSize(11);
  doc.text(`${labels.session} ${session.name}`, x, y + 3, { width: CONTENT_WIDTH, align: 'center' });
  doc.restore();
  doc.y = y + 20;
}

function drawWarmup(doc: PDFKit.PDFDocument, labels: Labels, session: ExportSession): void {
  const x = PAGE.margin;
  doc.fillColor(COLOR.black).font('Helvetica-Bold').fontSize(9);
  doc.text(labels.preparation, x, doc.y, { width: CONTENT_WIDTH, align: 'center' });
  if (session.warmupPrescription) {
    doc.font('Helvetica').fontSize(8).text(session.warmupPrescription, { width: CONTENT_WIDTH, align: 'center' });
  }
  doc.moveDown(0.3);

  const colWidth = CONTENT_WIDTH / 2;
  const top = doc.y;
  doc.font('Helvetica-Bold').fontSize(9);
  doc.text(labels.mobility, x, top, { width: colWidth, align: 'center' });
  doc.text(labels.activation, x + colWidth, top, { width: colWidth, align: 'center' });
  doc.font('Helvetica').fontSize(8);
  const listTop = doc.y;
  const mobility = session.mobility.map((n, i) => `${i + 1}- ${n}`).join('\n') || '—';
  const activation = session.activation.map((n, i) => `${i + 1}- ${n}`).join('\n') || '—';
  doc.text(mobility, x + 10, listTop, { width: colWidth - 20 });
  const afterMobility = doc.y;
  doc.text(activation, x + colWidth + 10, listTop, { width: colWidth - 20 });
  doc.y = Math.max(afterMobility, doc.y) + 4;
}

interface Columns {
  nameX: number;
  nameW: number;
  weekW: number;
  subW: number;
  weekX: (w: number) => number;
}

function computeColumns(weekCount: number): Columns {
  const nameW = Math.min(200, Math.max(140, CONTENT_WIDTH - weekCount * 90));
  const weekW = (CONTENT_WIDTH - nameW) / weekCount;
  const subW = weekW / 3;
  return {
    nameX: PAGE.margin,
    nameW,
    weekW,
    subW,
    weekX: (w: number) => PAGE.margin + nameW + w * weekW,
  };
}

function drawExercisesHeader(doc: PDFKit.PDFDocument, labels: Labels, cols: Columns, weekCount: number): void {
  ensureSpace(doc, 40);
  const y = doc.y;
  doc.save();
  doc.rect(PAGE.margin, y, CONTENT_WIDTH, 14).fill(COLOR.black);
  doc.fillColor(COLOR.white).font('Helvetica-Bold').fontSize(7.5);
  doc.text(labels.exercises, cols.nameX + 3, y + 4, { width: cols.nameW - 6 });
  for (let w = 0; w < weekCount; w += 1) {
    const wx = cols.weekX(w);
    doc.text(labels.kg, wx, y + 4, { width: cols.subW, align: 'center' });
    doc.text(labels.reps, wx + cols.subW, y + 4, { width: cols.subW, align: 'center' });
    doc.text(labels.series, wx + cols.subW * 2, y + 4, { width: cols.subW, align: 'center' });
  }
  doc.restore();
  doc.y = y + 14;
}

function drawWeekBar(doc: PDFKit.PDFDocument, labels: Labels, cols: Columns, weekCount: number): void {
  const y = doc.y;
  doc.save();
  doc.rect(PAGE.margin, y, CONTENT_WIDTH, 13).stroke(COLOR.rowBorder);
  doc.fillColor(COLOR.black).font('Helvetica-Bold').fontSize(7.5);
  doc.text(labels.weekOf, cols.nameX + 3, y + 3, { width: cols.nameW - 6 });
  for (let w = 0; w < weekCount; w += 1) {
    doc.text(`${labels.week} ${w + 1}`, cols.weekX(w), y + 3, { width: cols.weekW, align: 'center' });
  }
  doc.restore();
  doc.y = y + 13;
}

function drawBlock(doc: PDFKit.PDFDocument, cols: Columns, weekCount: number, block: ExportBlock): void {
  const rowH = 12;
  ensureSpace(doc, rowH * block.rows.length + 6);
  const blockTop = doc.y;
  block.rows.forEach((row, rowIndex) => {
    const y = blockTop + rowIndex * rowH;
    doc.rect(PAGE.margin, y, CONTENT_WIDTH, rowH).stroke(COLOR.rowBorder);
    doc.fillColor(COLOR.black).font('Helvetica').fontSize(7);
    doc.text(row.exercise, cols.nameX + 3, y + 3, { width: cols.nameW - 6, ellipsis: true, lineBreak: false });
    for (let w = 0; w < weekCount; w += 1) {
      const wx = cols.weekX(w);
      const cell: CellPrescription = row.perWeek[w];
      doc.text(cellText(cell.kg), wx, y + 3, { width: cols.subW, align: 'center' });
      doc.text(cellText(cell.reps), wx + cols.subW, y + 3, { width: cols.subW, align: 'center' });
    }
  });
  // SERIES is shared per block per week: draw it once, vertically centered.
  const blockH = block.rows.length * rowH;
  doc.font('Helvetica-Bold').fontSize(8);
  for (let w = 0; w < weekCount; w += 1) {
    const series = block.seriesByWeek[w];
    if (series != null) {
      doc.text(String(series), cols.weekX(w) + cols.subW * 2, blockTop + blockH / 2 - 4, {
        width: cols.subW,
        align: 'center',
      });
    }
  }
  doc.y = blockTop + blockH + 4;
}

function drawFinalBlock(doc: PDFKit.PDFDocument, labels: Labels, session: ExportSession): void {
  if (session.finalBlock.length === 0) return;
  ensureSpace(doc, 20 + session.finalBlock.length * 12);
  const x = PAGE.margin;
  const c1 = CONTENT_WIDTH * 0.45;
  const cw = CONTENT_WIDTH * 0.1;
  const obsX = x + c1 + cw * 3;
  const y = doc.y;
  doc.save();
  doc.rect(x, y, CONTENT_WIDTH, 14).fill(COLOR.black);
  doc.fillColor(COLOR.white).font('Helvetica-Bold').fontSize(7.5);
  doc.text(labels.finalBlock, x + 3, y + 4, { width: c1 - 6 });
  doc.text(labels.kg, x + c1, y + 4, { width: cw, align: 'center' });
  doc.text(labels.reps, x + c1 + cw, y + 4, { width: cw, align: 'center' });
  doc.text(labels.series, x + c1 + cw * 2, y + 4, { width: cw, align: 'center' });
  doc.text(labels.observations, obsX, y + 4, { width: CONTENT_WIDTH - c1 - cw * 3, align: 'center' });
  doc.restore();
  doc.y = y + 14;
  doc.fillColor(COLOR.black).font('Helvetica').fontSize(7);
  session.finalBlock.forEach((row, i) => {
    const ry = doc.y;
    doc.rect(x, ry, CONTENT_WIDTH, 12).stroke(COLOR.rowBorder);
    doc.text(`${i + 1}- ${row.exercise}`, x + 3, ry + 3, { width: c1 - 6, ellipsis: true, lineBreak: false });
    doc.text(cellText(row.kg), x + c1, ry + 3, { width: cw, align: 'center' });
    doc.text(cellText(row.reps), x + c1 + cw, ry + 3, { width: cw, align: 'center' });
    doc.text(cellText(row.series), x + c1 + cw * 2, ry + 3, { width: cw, align: 'center' });
    doc.text(row.notes ?? '', obsX + 3, ry + 3, { width: CONTENT_WIDTH - c1 - cw * 3 - 6, ellipsis: true, lineBreak: false });
    doc.y = ry + 12;
  });
  doc.moveDown(0.5);
}

/**
 * Builds a routine PDF matching the trainer's plan format (US-030). Returns the
 * PDFKit document WITHOUT calling `.end()`, so the caller controls the lifecycle.
 */
export function buildRoutinePdf(
  routine: RoutineTemplate,
  lang: PdfLang = 'es',
  clientName: string | null = null,
): PDFKit.PDFDocument {
  const labels = resolveLabels(lang);
  const model = buildRoutineExportModel(routine, clientName);
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: PAGE.margin });

  // The brand band is drawn on the first page and on every page added afterwards.
  doc.on('pageAdded', () => drawBrandBand(doc));
  drawBrandBand(doc);
  doc.y = CONTENT_TOP;

  try {
    doc.image(LOGO_PATH, PAGE.width / 2 - 28, doc.y, { width: 56 });
  } catch {
    // The logo is optional for rendering; ignore if the asset is unavailable.
  }
  doc.y += 62;
  doc.fillColor(COLOR.black).font('Helvetica-BoldOblique').fontSize(16);
  doc.text(labels.plan, PAGE.margin, doc.y, { width: CONTENT_WIDTH, align: 'center' });
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(9);
  doc.text(`${labels.client}: ${model.clientName ?? '—'}`, { width: CONTENT_WIDTH, align: 'center' });
  doc.text(`${labels.startDate}: ${fmtDate(model.startDate)}`, { width: CONTENT_WIDTH, align: 'center' });
  doc.moveDown(0.6);

  if (model.sessions.length === 0) {
    doc.font('Helvetica-Oblique').fontSize(11).text(labels.empty, { width: CONTENT_WIDTH, align: 'center' });
    return doc;
  }

  model.sessions.forEach((session) => {
    const cols = computeColumns(session.weekCount);
    drawSessionBar(doc, labels, session);
    drawWeekBar(doc, labels, cols, session.weekCount);
    drawWarmup(doc, labels, session);
    drawExercisesHeader(doc, labels, cols, session.weekCount);
    session.blocks.forEach((block) => drawBlock(doc, cols, session.weekCount, block));
    drawFinalBlock(doc, labels, session);
    doc.moveDown(0.5);
  });

  if (model.considerations) {
    doc.addPage();
    doc.y = CONTENT_TOP;
    doc.fillColor(COLOR.black).font('Helvetica-Bold').fontSize(12);
    doc.text(labels.considerations, PAGE.margin, doc.y, { width: CONTENT_WIDTH });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10).text(model.considerations, { width: CONTENT_WIDTH });
  }

  return doc;
}
