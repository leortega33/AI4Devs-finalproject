import { NextFunction, Request, Response } from 'express';
import { RoutineTemplateService } from '../../application/services/routineTemplateService';
import { validateRoutineTemplate } from '../../application/validator';
import { buildRoutinePdf, PdfLang } from '../../infrastructure/pdf/routinePdf';
import { buildRoutineXlsx } from '../../infrastructure/xlsx/routineXlsx';

function parseId(raw: string): number {
  const id = Number(raw);
  return Number.isInteger(id) ? id : NaN;
}

function parseLang(raw: unknown): PdfLang {
  return raw === 'en' ? 'en' : 'es';
}

const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export class RoutineTemplateController {
  constructor(private readonly routineTemplateService: RoutineTemplateService) {}

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const templates = await this.routineTemplateService.list();
      res.status(200).json({ success: true, data: templates });
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const template = await this.routineTemplateService.findById(parseId(req.params.id));
      res.status(200).json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = validateRoutineTemplate(req.body);
      const template = await this.routineTemplateService.create(data);
      res.status(201).json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = validateRoutineTemplate(req.body);
      const template = await this.routineTemplateService.update(parseId(req.params.id), data);
      res.status(200).json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  };

  duplicate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const template = await this.routineTemplateService.duplicate(parseId(req.params.id));
      res.status(201).json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  };

  exportPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseId(req.params.id);
      // Resolve the routine first so a missing id surfaces as 404 before streaming starts.
      const routine = await this.routineTemplateService.getExportData(id);
      const lang = parseLang(req.query.lang);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="routine-${id}.pdf"`);

      const doc = buildRoutinePdf(routine, lang, routine.clientName);
      doc.pipe(res);
      doc.end();
    } catch (error) {
      next(error);
    }
  };

  exportXlsx = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseId(req.params.id);
      const routine = await this.routineTemplateService.getExportData(id);
      const lang = parseLang(req.query.lang);
      const buffer = await buildRoutineXlsx(routine, lang, routine.clientName);

      res.setHeader('Content-Type', XLSX_CONTENT_TYPE);
      res.setHeader('Content-Disposition', `attachment; filename="routine-${id}.xlsx"`);
      res.status(200).send(buffer);
    } catch (error) {
      next(error);
    }
  };
}
