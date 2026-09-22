import { NextFunction, Request, Response } from 'express';
import { ProgressService } from '../../application/services/progressService';
import { validateProgress } from '../../application/validator';

function parseId(raw: string): number {
  const id = Number(raw);
  return Number.isInteger(id) ? id : NaN;
}

export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  record = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = validateProgress(req.body);
      const entry = await this.progressService.record(parseId(req.params.clientId), data);
      res.status(201).json({ success: true, data: entry });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.progressService.list(parseId(req.params.clientId));
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.progressService.remove(parseId(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
