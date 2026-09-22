import { RoutineTemplate } from '../../domain/models/RoutineTemplate';
import { RoutineExerciseEntry } from '../../domain/models/RoutineExerciseEntry';

/** Maximum number of week columns rendered before values are shrunk/paginated. */
export const MAX_WEEK_COLUMNS = 8;

export interface CellPrescription {
  kg: number | null;
  reps: number | null;
  series: number | null;
}

export interface ExportRow {
  exercise: string;
  perWeek: CellPrescription[];
  notes: string | null;
}

export interface ExportBlock {
  rows: ExportRow[];
  /** The block's shared SERIES per week (supersets share a series count). */
  seriesByWeek: (number | null)[];
}

export interface ExportFinalRow {
  exercise: string;
  kg: number | null;
  reps: number | null;
  series: number | null;
  notes: string | null;
}

export interface ExportSession {
  name: string;
  warmupPrescription: string | null;
  mobility: string[];
  activation: string[];
  weekCount: number;
  blocks: ExportBlock[];
  finalBlock: ExportFinalRow[];
}

export interface RoutineExportModel {
  routineName: string;
  clientName: string | null;
  startDate: Date | null;
  considerations: string | null;
  weekCount: number;
  sessions: ExportSession[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isFinalBlock(label: string | null): boolean {
  if (!label) return false;
  const normalized = label.trim().toLowerCase();
  return normalized === 'final' || normalized === 'bloque final';
}

function exerciseName(entry: RoutineExerciseEntry): string {
  return entry.exerciseName ?? `#${entry.exerciseId}`;
}

/** The per-week prescription for an entry; base values fall into week 1 when it has no weeks. */
function perWeekPrescription(entry: RoutineExerciseEntry, weekCount: number): CellPrescription[] {
  const cells: CellPrescription[] = [];
  const hasWeeks = entry.weeks.length > 0;
  for (let w = 1; w <= weekCount; w += 1) {
    if (hasWeeks) {
      const week = entry.weeks.find((x) => x.week === w);
      cells.push({ kg: week?.kg ?? null, reps: week?.reps ?? null, series: week?.series ?? null });
    } else if (w === 1) {
      cells.push({ kg: entry.kg, reps: entry.reps, series: entry.series });
    } else {
      cells.push({ kg: null, reps: null, series: null });
    }
  }
  return cells;
}

/** Groups consecutive main entries into blocks by their block label (null = its own singleton). */
function groupBlocks(entries: RoutineExerciseEntry[], weekCount: number): ExportBlock[] {
  const blocks: ExportBlock[] = [];
  let currentLabel: string | null | undefined;
  entries.forEach((entry) => {
    const row: ExportRow = { exercise: exerciseName(entry), perWeek: perWeekPrescription(entry, weekCount), notes: entry.notes };
    const label = entry.block;
    const sameBlock = label != null && label === currentLabel && blocks.length > 0;
    if (sameBlock) {
      blocks[blocks.length - 1].rows.push(row);
    } else {
      blocks.push({ rows: [row], seriesByWeek: [] });
      currentLabel = label ?? undefined;
    }
  });
  // The block's series per week = the first row with a non-null series that week.
  blocks.forEach((block) => {
    block.seriesByWeek = Array.from({ length: weekCount }, (_, w) => {
      const withSeries = block.rows.find((r) => r.perWeek[w]?.series != null);
      return withSeries ? (withSeries.perWeek[w].series as number) : null;
    });
  });
  return blocks;
}

/**
 * Maps a routine to a renderer-agnostic export view model (US-030): warm-up split
 * by exercise category, main entries grouped into blocks with per-week columns and
 * a shared series per block, a detected final block, and the considerations text.
 */
export function buildRoutineExportModel(
  routine: RoutineTemplate,
  clientName: string | null = null,
): RoutineExportModel {
  const weekCount = clamp(routine.durationWeeks ?? 1, 1, MAX_WEEK_COLUMNS);
  const sessions = [...routine.sessions]
    .sort((a, b) => a.order - b.order)
    .map((session): ExportSession => {
      const entries = [...session.entries].sort((a, b) => a.order - b.order);
      const warmup = entries.filter((e) => e.phase === 'warmup');
      const main = entries.filter((e) => e.phase === 'main');
      const finalEntries = main.filter((e) => isFinalBlock(e.block));
      const mainEntries = main.filter((e) => !isFinalBlock(e.block));

      return {
        name: session.name,
        warmupPrescription: session.warmupPrescription,
        mobility: warmup.filter((e) => e.exerciseCategory !== 'activation').map(exerciseName),
        activation: warmup.filter((e) => e.exerciseCategory === 'activation').map(exerciseName),
        weekCount,
        blocks: groupBlocks(mainEntries, weekCount),
        finalBlock: finalEntries.map((e) => ({
          exercise: exerciseName(e),
          kg: e.kg,
          reps: e.reps,
          series: e.series,
          notes: e.notes,
        })),
      };
    });

  return {
    routineName: routine.name,
    clientName,
    startDate: routine.startDate ?? null,
    considerations: routine.generalConsiderations ?? null,
    weekCount,
    sessions,
  };
}
