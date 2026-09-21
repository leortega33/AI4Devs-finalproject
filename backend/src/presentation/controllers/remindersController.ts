import { NextFunction, Request, Response } from 'express';
import { ReminderService } from '../../application/services/reminderService';

export class RemindersController {
  constructor(private readonly reminderService: ReminderService) {}

  run = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.reminderService.run();
      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  };
}
