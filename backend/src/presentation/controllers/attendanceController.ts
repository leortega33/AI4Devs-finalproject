import { NextFunction, Request, Response } from 'express';
import { AttendanceService } from '../../application/services/attendanceService';
import { validateAttendance } from '../../application/validator';

function parseId(raw: string): number {
  const id = Number(raw);
  return Number.isInteger(id) ? id : NaN;
}

export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = validateAttendance(req.body);
      const attendance = await this.attendanceService.record(parseId(req.params.clientId), data);
      res.status(201).json({ success: true, data: attendance });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.attendanceService.list(parseId(req.params.clientId));
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.attendanceService.remove(parseId(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
