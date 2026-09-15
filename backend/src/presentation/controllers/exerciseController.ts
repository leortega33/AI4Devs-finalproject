import { NextFunction, Request, Response } from 'express';
import { ExerciseService } from '../../application/services/exerciseService';
import { validateExercise } from '../../application/validator';
import { ExerciseCategory } from '../../domain/models/Exercise';

function parseId(raw: string): number {
  const id = Number(raw);
  return Number.isInteger(id) ? id : NaN;
}

const CATEGORIES: ExerciseCategory[] = ['mobility', 'activation', 'main'];

export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const category = CATEGORIES.includes(req.query.category as ExerciseCategory)
        ? (req.query.category as ExerciseCategory)
        : undefined;
      const exercises = await this.exerciseService.list({ search, category });
      res.status(200).json({ success: true, data: exercises });
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exercise = await this.exerciseService.findById(parseId(req.params.id));
      res.status(200).json({ success: true, data: exercise });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = validateExercise(req.body);
      const exercise = await this.exerciseService.create(data);
      res.status(201).json({ success: true, data: exercise });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = validateExercise(req.body);
      const exercise = await this.exerciseService.update(parseId(req.params.id), data);
      res.status(200).json({ success: true, data: exercise });
    } catch (error) {
      next(error);
    }
  };
}
