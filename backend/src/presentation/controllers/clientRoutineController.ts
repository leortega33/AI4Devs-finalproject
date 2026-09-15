import { NextFunction, Request, Response } from 'express';
import { ClientRoutineService } from '../../application/services/clientRoutineService';
import { validateAssignRoutine, validateRoutineTemplate } from '../../application/validator';
import { RoutineTemplate } from '../../domain/models/RoutineTemplate';

function parseId(raw: string): number {
  const id = Number(raw);
  return Number.isInteger(id) ? id : NaN;
}

/** Serializes a client routine including its computed end date and expiration flag. */
function toResponse(routine: RoutineTemplate) {
  return { ...routine, endDate: routine.endDate, isExpired: routine.isExpired() };
}

export class ClientRoutineController {
  constructor(private readonly clientRoutineService: ClientRoutineService) {}

  assign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = validateAssignRoutine(req.body);
      const routine = await this.clientRoutineService.assign(parseId(req.params.clientId), data);
      res.status(201).json({ success: true, data: toResponse(routine) });
    } catch (error) {
      next(error);
    }
  };

  getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const routine = await this.clientRoutineService.getActive(parseId(req.params.clientId));
      res.status(200).json({ success: true, data: routine ? toResponse(routine) : null });
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const history = await this.clientRoutineService.getHistory(parseId(req.params.clientId));
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  };

  adjust = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = validateRoutineTemplate(req.body);
      const routine = await this.clientRoutineService.adjust(parseId(req.params.clientId), data);
      res.status(200).json({ success: true, data: toResponse(routine) });
    } catch (error) {
      next(error);
    }
  };
}
