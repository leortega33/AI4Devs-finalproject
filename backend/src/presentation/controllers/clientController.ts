import { NextFunction, Request, Response } from 'express';
import { ClientService } from '../../application/services/clientService';
import { validateClient, validateClientStatus } from '../../application/validator';
import { ClientStatus } from '../../domain/models/Client';

function parseId(raw: string): number {
  const id = Number(raw);
  return Number.isInteger(id) ? id : NaN;
}

export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const status =
        req.query.status === 'active' || req.query.status === 'inactive'
          ? (req.query.status as ClientStatus)
          : undefined;
      const clients = await this.clientService.list({ search, status });
      res.status(200).json({ success: true, data: clients });
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const client = await this.clientService.findById(parseId(req.params.id));
      res.status(200).json({ success: true, data: client });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = validateClient(req.body);
      const client = await this.clientService.create(data);
      res.status(201).json({ success: true, data: client });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = validateClient(req.body);
      const client = await this.clientService.update(parseId(req.params.id), data);
      res.status(200).json({ success: true, data: client });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = validateClientStatus(req.body);
      const client = await this.clientService.setStatus(parseId(req.params.id), status);
      res.status(200).json({ success: true, data: client });
    } catch (error) {
      next(error);
    }
  };
}
