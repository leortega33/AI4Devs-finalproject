import { NextFunction, Request, Response } from 'express';
import { DashboardService } from '../../application/services/dashboardService';

export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly dueSoonDays: number,
  ) {}

  get = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.dashboardService.getDashboard(new Date(), this.dueSoonDays);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
