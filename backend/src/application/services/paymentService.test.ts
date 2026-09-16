import {
  PaymentService,
  PaymentNotFoundError,
  computePaymentStatus,
} from './paymentService';
import { ClientNotFoundError } from './clientService';
import { Payment } from '../../domain/models/Payment';
import { Client } from '../../domain/models/Client';
import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';

function buildPaymentRepoMock(): jest.Mocked<PaymentRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findByClient: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

function buildClientRepoMock(): jest.Mocked<ClientRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findByDni: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    setStatus: jest.fn(),
  };
}

function makeClient(): Client {
  return new Client({
    id: 3,
    firstName: 'John',
    lastName: 'Doe',
    dni: '12345678',
    phone: '+542604000000',
    email: 'john@example.com',
    birthDate: new Date('1990-01-01'),
  });
}

function makePayment(overrides: Partial<{ id: number; periodMonth: number; periodYear: number }> = {}): Payment {
  return new Payment({
    id: overrides.id ?? 1,
    clientId: 3,
    amount: 5000,
    paymentDate: new Date('2026-02-05'),
    method: 'cash',
    periodMonth: overrides.periodMonth ?? 2,
    periodYear: overrides.periodYear ?? 2026,
  });
}

const input = {
  amount: 5000,
  paymentDate: new Date('2026-02-05'),
  method: 'cash' as const,
  periodMonth: 2,
  periodYear: 2026,
};

describe('computePaymentStatus', () => {
  it('should be no_payments when there are none', () => {
    expect(computePaymentStatus([], new Date('2026-02-15'))).toBe('no_payments');
  });

  it('should be up_to_date when today is within the covered month', () => {
    const payments = [makePayment({ periodMonth: 2, periodYear: 2026 })];
    expect(computePaymentStatus(payments, new Date('2026-02-15'))).toBe('up_to_date');
  });

  it('should be up_to_date when the covered period is in the future', () => {
    const payments = [makePayment({ periodMonth: 5, periodYear: 2026 })];
    expect(computePaymentStatus(payments, new Date('2026-02-15'))).toBe('up_to_date');
  });

  it('should be overdue when today is past the end of the covered month', () => {
    const payments = [makePayment({ periodMonth: 1, periodYear: 2026 })];
    expect(computePaymentStatus(payments, new Date('2026-02-15'))).toBe('overdue');
  });

  it('should use the most recent covered period', () => {
    const payments = [
      makePayment({ id: 1, periodMonth: 1, periodYear: 2026 }),
      makePayment({ id: 2, periodMonth: 3, periodYear: 2026 }),
    ];
    expect(computePaymentStatus(payments, new Date('2026-03-10'))).toBe('up_to_date');
  });
});

describe('PaymentService', () => {
  let paymentRepo: jest.Mocked<PaymentRepository>;
  let clientRepo: jest.Mocked<ClientRepository>;
  let service: PaymentService;

  beforeEach(() => {
    jest.clearAllMocks();
    paymentRepo = buildPaymentRepoMock();
    clientRepo = buildClientRepoMock();
    service = new PaymentService(paymentRepo, clientRepo);
  });

  describe('register', () => {
    it('should register a payment for an existing client', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      paymentRepo.create.mockResolvedValue(makePayment());

      const result = await service.register(3, input);

      expect(result.amount).toBe(5000);
      expect(paymentRepo.create).toHaveBeenCalledWith(3, input);
    });

    it('should throw when the client does not exist', async () => {
      clientRepo.findById.mockResolvedValue(null);

      await expect(service.register(999, input)).rejects.toThrow(ClientNotFoundError);
      expect(paymentRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('listByClient', () => {
    it('should return the payments and the derived status', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      paymentRepo.findByClient.mockResolvedValue([makePayment()]);

      const result = await service.listByClient(3);

      expect(result.payments).toHaveLength(1);
      expect(['up_to_date', 'overdue', 'no_payments']).toContain(result.status);
    });

    it('should throw when the client does not exist', async () => {
      clientRepo.findById.mockResolvedValue(null);

      await expect(service.listByClient(999)).rejects.toThrow(ClientNotFoundError);
    });
  });

  describe('update', () => {
    it('should update an existing payment', async () => {
      paymentRepo.findById.mockResolvedValue(makePayment());
      paymentRepo.update.mockResolvedValue(makePayment());

      const result = await service.update(1, input);

      expect(result.id).toBe(1);
      expect(paymentRepo.update).toHaveBeenCalledWith(1, input);
    });

    it('should throw when the payment does not exist', async () => {
      paymentRepo.findById.mockResolvedValue(null);

      await expect(service.update(999, input)).rejects.toThrow(PaymentNotFoundError);
      expect(paymentRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an existing payment', async () => {
      paymentRepo.findById.mockResolvedValue(makePayment());

      await service.delete(1);

      expect(paymentRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw when the payment does not exist', async () => {
      paymentRepo.findById.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(PaymentNotFoundError);
      expect(paymentRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('getExportData', () => {
    it('should return the client, payments and derived status', async () => {
      const client = makeClient();
      clientRepo.findById.mockResolvedValue(client);
      paymentRepo.findByClient.mockResolvedValue([makePayment()]);

      const result = await service.getExportData(3);

      expect(result.client).toBe(client);
      expect(result.payments).toHaveLength(1);
      expect(['up_to_date', 'overdue', 'no_payments']).toContain(result.status);
      expect(paymentRepo.findByClient).toHaveBeenCalledWith(3);
    });

    it('should throw when the client does not exist', async () => {
      clientRepo.findById.mockResolvedValue(null);

      await expect(service.getExportData(999)).rejects.toThrow(ClientNotFoundError);
      expect(paymentRepo.findByClient).not.toHaveBeenCalled();
    });
  });
});
