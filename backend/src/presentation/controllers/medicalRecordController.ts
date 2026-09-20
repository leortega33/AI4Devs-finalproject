import { NextFunction, Request, Response } from 'express';
import { MedicalRecordService } from '../../application/services/medicalRecordService';
import { validateMedicalRecord } from '../../application/validator';

function parseId(raw: string): number {
  const id = Number(raw);
  return Number.isInteger(id) ? id : NaN;
}

export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const record = await this.medicalRecordService.getByClientId(parseId(req.params.clientId));
      res.status(200).json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  };

  upsert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = validateMedicalRecord(req.body);
      const record = await this.medicalRecordService.upsert(parseId(req.params.clientId), data);
      res.status(200).json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  };

  history = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const versions = await this.medicalRecordService.getHistory(parseId(req.params.clientId));
      res.status(200).json({ success: true, data: versions });
    } catch (error) {
      next(error);
    }
  };
}
