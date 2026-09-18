import PDFDocument from 'pdfkit';
import { RoutineTemplate } from '../../domain/models/RoutineTemplate';
import { RoutineExerciseEntry } from '../../domain/models/RoutineExerciseEntry';

export type PdfLang = 'es' | 'en';

interface Labels {
  title: string;
  objective: string;
  session: string;
  warmup: string;
  main: string;
  exercise: string;
  block: string;
  prescription: string;
  notes: string;
  empty: string;
}

const LABELS: Record<PdfLang, Labels> = {
  es: {
    title: 'Rutina',
    objective: 'Objetivo',
    session: 'Sesión',
    warmup: 'Entrada en calor',
    main: 'Bloque principal',
    exercise: 'Ejercicio',
    block: 'Bloque',
    prescription: 'kg / reps / series',
    notes: 'Notas',
    empty: 'Esta rutina no tiene sesiones cargadas.',
  },
  en: {
    title: 'Routine',
    objective: 'Objective',
    session: 'Session',
    warmup: 'Warm-up',
    main: 'Main block',
    exercise: 'Exercise',
    block: 'Block',
    prescription: 'kg / reps / sets',
    notes: 'Notes',
    empty: 'This routine has no sessions.',
  },
};

function resolveLabels(lang: PdfLang): Labels {
  return LABELS[lang] ?? LABELS.es;
}

// A compact "kg × reps × series" prescription string, omitting empty parts.
function formatPrescription(entry: RoutineExerciseEntry): string {
  const parts: string[] = [];
  if (entry.kg !== null) parts.push(`${entry.kg} kg`);
  if (entry.reps !== null) parts.push(`${entry.reps} reps`);
  if (entry.series !== null) parts.push(`${entry.series}x`);
  return parts.join(' · ');
}

function entryLine(entry: RoutineExerciseEntry): string {
  const segments: string[] = [entry.exerciseName ?? `#${entry.exerciseId}`];
  if (entry.block) segments.push(`[${entry.block}]`);
  const prescription = formatPrescription(entry);
  if (prescription) segments.push(prescription);
  if (entry.notes) segments.push(`— ${entry.notes}`);
  return segments.join('  ');
}

/**
 * Builds a routine PDF document (US-017). Returns the PDFKit document WITHOUT
 * calling `.end()`, so the caller controls piping and lifecycle.
 */
export function buildRoutinePdf(routine: RoutineTemplate, lang: PdfLang = 'es'): PDFKit.PDFDocument {
  const labels = resolveLabels(lang);
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  doc.fontSize(20).font('Helvetica-Bold').text(`${labels.title}: ${routine.name}`);
  if (routine.objective) {
    doc.moveDown(0.3);
    doc.fontSize(12).font('Helvetica').text(`${labels.objective}: ${routine.objective}`);
  }
  doc.moveDown(1);

  const sessions = [...routine.sessions].sort((a, b) => a.order - b.order);
  if (sessions.length === 0) {
    doc.fontSize(12).font('Helvetica-Oblique').text(labels.empty);
    return doc;
  }

  sessions.forEach((session, index) => {
    if (index > 0) doc.moveDown(0.8);
    doc.fontSize(14).font('Helvetica-Bold').text(`${labels.session}: ${session.name}`);

    const entries = [...session.entries].sort((a, b) => a.order - b.order);
    const warmupEntries = entries.filter((e) => e.phase === 'warmup');
    const mainEntries = entries.filter((e) => e.phase === 'main');

    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica-Bold').text(labels.warmup);
    doc.font('Helvetica');
    if (session.warmupPrescription) {
      doc.text(session.warmupPrescription);
    }
    warmupEntries.forEach((entry) => doc.text(`• ${entryLine(entry)}`));

    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica-Bold').text(labels.main);
    doc.font('Helvetica');
    mainEntries.forEach((entry) => doc.text(`• ${entryLine(entry)}`));
  });

  return doc;
}
