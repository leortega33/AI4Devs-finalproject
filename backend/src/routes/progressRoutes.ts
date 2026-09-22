import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ProgressController } from '../presentation/controllers/progressController';
import { ProgressService } from '../application/services/progressService';
import { ALLOWED_MIME_TYPES } from '../application/imageProcessing';
import { ValidationError } from '../application/validator';
import { createAuthMiddleware } from '../middleware/authMiddleware';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_PHOTOS_PER_REQUEST = 10;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PHOTO_BYTES, files: MAX_PHOTOS_PER_REQUEST },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ValidationError('Unsupported image type'));
    }
  },
});

/** Runs multer for the `photos` field and maps upload limits to a 400 ValidationError. */
function uploadPhotos(req: Request, res: Response, next: NextFunction): void {
  upload.array('photos', MAX_PHOTOS_PER_REQUEST)(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      next(
        new ValidationError(
          err.code === 'LIMIT_FILE_SIZE' ? 'Image exceeds the 5 MB size limit' : err.message,
        ),
      );
      return;
    }
    if (err) {
      next(err as Error);
      return;
    }
    next();
  });
}

/**
 * Client-scoped progress routes nested under a client
 * (`/api/clients/:clientId/progress`): record (with optional photos), list
 * (+summary +photos), delete an entry, and add/stream/delete photos.
 * Protected (US-026, US-026b).
 */
export function createClientProgressRoutes(progressService: ProgressService, jwtSecret: string): Router {
  const router = Router({ mergeParams: true });
  const controller = new ProgressController(progressService);
  const authMiddleware = createAuthMiddleware(jwtSecret);

  router.use(authMiddleware);
  router.post('/', uploadPhotos, controller.record);
  router.get('/', controller.list);
  router.delete('/:id', controller.remove);
  router.post('/:entryId/photos', uploadPhotos, controller.addPhotos);
  router.get('/:entryId/photos/:photoId', controller.streamPhoto);
  router.delete('/:entryId/photos/:photoId', controller.removePhoto);

  return router;
}
