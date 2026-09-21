import { NextFunction, Request, Response } from 'express';
import { WarmupSuggestionService } from '../../application/services/warmupSuggestionService';

function parseId(raw: string): number {
  const id = Number(raw);
  return Number.isInteger(id) ? id : NaN;
}

export class WarmupSuggestionController {
  constructor(private readonly warmupSuggestionService: WarmupSuggestionService) {}

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const suggestions = await this.warmupSuggestionService.getSuggestions(
        parseId(req.params.clientId),
      );
      res.status(200).json({ success: true, data: suggestions });
    } catch (error) {
      next(error);
    }
  };
}
