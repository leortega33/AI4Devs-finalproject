import { RoutineTemplate, RoutineStatus } from '../models/RoutineTemplate';
import { RoutinePhase } from '../models/RoutineExerciseEntry';

export interface RoutineExerciseEntryInput {
  exerciseId: number;
  phase: RoutinePhase;
  block?: string | null;
  kg?: number | null;
  reps?: number | null;
  series?: number | null;
  notes?: string | null;
  order: number;
}

export interface RoutineSessionInput {
  name: string;
  warmupPrescription?: string | null;
  order: number;
  entries: RoutineExerciseEntryInput[];
}

/** Input for creating or replacing a library routine template and its nested data. */
export interface RoutineTemplateInput {
  name: string;
  description?: string | null;
  objective?: string | null;
  generalConsiderations?: string | null;
  sessions: RoutineSessionInput[];
}

/** Lightweight row for the template list (no deep nesting). */
export interface RoutineTemplateSummary {
  id: number;
  name: string;
  objective: string | null;
  status: RoutineStatus;
  sessionCount: number;
}

/** Data access contract for routine templates (see docs/backend-standards.md). */
export interface RoutineTemplateRepository {
  create(data: RoutineTemplateInput): Promise<RoutineTemplate>;
  findById(id: number): Promise<RoutineTemplate | null>;
  findAllLibrary(): Promise<RoutineTemplateSummary[]>;
  replaceNested(id: number, data: RoutineTemplateInput): Promise<RoutineTemplate>;
  duplicate(id: number): Promise<RoutineTemplate | null>;

  // Client routine assignment (US-006). A client routine is a template row with
  // clientId/sourceTemplateId/startDate/durationWeeks/status populated.
  assignCloneToClient(
    clientId: number,
    templateId: number,
    startDate: Date,
    durationWeeks: number,
  ): Promise<RoutineTemplate | null>;
  findActiveByClient(clientId: number): Promise<RoutineTemplate | null>;
  findHistoryByClient(clientId: number): Promise<RoutineTemplateSummary[]>;
}
