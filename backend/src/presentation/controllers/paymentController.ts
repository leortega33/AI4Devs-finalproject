import { NextFunction, Request, Response } from 'express';
import { PaymentService } from '../../application/services/paymentService';
import { validatePayment } from '../../application/validator';

function parseId(raw: string): number {
  const id = Number(raw);
  return Number.isInteger(id) ? id : NaN;
}

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = validatePayment(req.body);
      const payment = await this.paymentService.register(parseId(req.params.clientId), data);
      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.paymentService.listByClient(parseId(req.params.clientId));
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = validatePayment(req.body);
      const payment = await this.paymentService.update(parseId(req.params.id), data);
      res.status(200).json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.paymentService.delete(parseId(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
