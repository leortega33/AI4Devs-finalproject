import { NextFunction, Request, Response } from 'express';
import { ProgressService, PhotoUpload } from '../../application/services/progressService';
import { validateProgress } from '../../application/validator';

function parseId(raw: string): number {
  const id = Number(raw);
  return Number.isInteger(id) ? id : NaN;
}

function toUploads(req: Request): PhotoUpload[] {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  return files.map((file) => ({ mimetype: file.mimetype, buffer: file.buffer }));
}

export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  record = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = validateProgress(req.body);
      const entry = await this.progressService.record(parseId(req.params.clientId), data, toUploads(req));
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

  addPhotos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const photos = await this.progressService.addPhotos(
        parseId(req.params.clientId),
        parseId(req.params.entryId),
        toUploads(req),
      );
      res.status(201).json({ success: true, data: photos });
    } catch (error) {
      next(error);
    }
  };

  streamPhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { bytes, contentType } = await this.progressService.getPhoto(parseId(req.params.photoId));
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'private, no-store');
      res.status(200).send(bytes);
    } catch (error) {
      next(error);
    }
  };

  removePhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.progressService.removePhoto(parseId(req.params.photoId));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
