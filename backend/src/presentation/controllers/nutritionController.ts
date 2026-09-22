import { NextFunction, Request, Response } from 'express';
import { NutritionService } from '../../application/services/nutritionService';
import { validateNutritionPlan } from '../../application/validator';

function parseId(raw: string): number {
  const id = Number(raw);
  return Number.isInteger(id) ? id : NaN;
}

export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  getPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const plan = await this.nutritionService.getPlan(parseId(req.params.clientId));
      res.status(200).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  };

  savePlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = validateNutritionPlan(req.body);
      const plan = await this.nutritionService.savePlan(parseId(req.params.clientId), data);
      res.status(200).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  };

  getVersions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const versions = await this.nutritionService.getVersions(parseId(req.params.clientId));
      res.status(200).json({ success: true, data: versions });
    } catch (error) {
      next(error);
    }
  };
}
