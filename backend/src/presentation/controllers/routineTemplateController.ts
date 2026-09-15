import { NextFunction, Request, Response } from 'express';
import { RoutineTemplateService } from '../../application/services/routineTemplateService';
import { validateRoutineTemplate } from '../../application/validator';

function parseId(raw: string): number {
  const id = Number(raw);
  return Number.isInteger(id) ? id : NaN;
}

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
}
