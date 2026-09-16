import { NextFunction, Request, Response } from 'express';
import { PaymentService } from '../../application/services/paymentService';
import { validatePayment } from '../../application/validator';
import { buildPaymentHistoryPdf, PdfLang } from '../../infrastructure/pdf/paymentHistoryPdf';

function parseId(raw: string): number {
  const id = Number(raw);
  return Number.isInteger(id) ? id : NaN;
}

function parseLang(raw: unknown): PdfLang {
  return raw === 'en' ? 'en' : 'es';
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

  exportHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = parseId(req.params.clientId);
      // Resolve the data first so a missing client surfaces as 404 before streaming starts.
      const data = await this.paymentService.getExportData(clientId);
      const lang = parseLang(req.query.lang);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="payment-history-${clientId}.pdf"`);

      const doc = buildPaymentHistoryPdf(data, lang);
      doc.pipe(res);
      doc.end();
    } catch (error) {
      next(error);
    }
  };
}
