import { NextFunction, Request, Response } from 'express';
import { MedicalFlagsService } from '../../application/services/medicalFlagsService';

function parseId(raw: string): number {
  const id = Number(raw);
  return Number.isInteger(id) ? id : NaN;
}

export class MedicalFlagsController {
  constructor(private readonly medicalFlagsService: MedicalFlagsService) {}

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const flags = await this.medicalFlagsService.getFlags(parseId(req.params.clientId));
      res.status(200).json({ success: true, data: flags });
    } catch (error) {
      next(error);
    }
  };
}
