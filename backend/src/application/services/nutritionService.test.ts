import { NutritionService } from './nutritionService';
import { ClientNotFoundError } from './clientService';
import { NutritionPlan } from '../../domain/models/NutritionPlan';
import { Client } from '../../domain/models/Client';
import { NutritionPlanRepository } from '../../domain/repositories/NutritionPlanRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';

function buildNutritionRepositoryMock(): jest.Mocked<NutritionPlanRepository> {
  return {
    findByClientId: jest.fn(),
    upsert: jest.fn(),
    listVersionsByClientId: jest.fn(),
  };
}

function buildClientRepositoryMock(): jest.Mocked<ClientRepository> {
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
    id: 10,
    firstName: 'Ana',
    lastName: 'Gómez',
    dni: '30111222',
    phone: '+540000',
    email: 'ana@example.com',
    birthDate: new Date('1990-01-01'),
  });
}

function makePlan(): NutritionPlan {
  return new NutritionPlan({
    id: 1,
    clientId: 10,
    dailyCalories: 2200,
    meals: [{ id: 5, name: 'Desayuno', order: 0, items: [{ id: 9, description: 'Avena', order: 0 }] }],
  });
}

const input = { dailyCalories: 2200, meals: [{ name: 'Desayuno', items: [{ description: 'Avena' }] }] };

describe('NutritionService', () => {
  let nutritionRepo: jest.Mocked<NutritionPlanRepository>;
  let clientRepo: jest.Mocked<ClientRepository>;
  let service: NutritionService;

  beforeEach(() => {
    jest.clearAllMocks();
    nutritionRepo = buildNutritionRepositoryMock();
    clientRepo = buildClientRepositoryMock();
    service = new NutritionService(nutritionRepo, clientRepo);
  });

  describe('getPlan', () => {
    it('returns the existing plan', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      nutritionRepo.findByClientId.mockResolvedValue(makePlan());

      const result = await service.getPlan(10);

      expect((result as NutritionPlan).meals[0].name).toBe('Desayuno');
    });

    it('returns an empty payload when the client has no plan', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      nutritionRepo.findByClientId.mockResolvedValue(null);

      const result = await service.getPlan(10);

      expect(result).toEqual({ dailyCalories: null, proteinTargetG: null, generalNotes: null, meals: [] });
    });

    it('throws when the client does not exist', async () => {
      clientRepo.findById.mockResolvedValue(null);

      await expect(service.getPlan(999)).rejects.toThrow(ClientNotFoundError);
      expect(nutritionRepo.findByClientId).not.toHaveBeenCalled();
    });
  });

  describe('savePlan', () => {
    it('upserts the plan', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      nutritionRepo.upsert.mockResolvedValue(makePlan());

      const result = await service.savePlan(10, input);

      expect(nutritionRepo.upsert).toHaveBeenCalledWith(10, input);
      expect(result.dailyCalories).toBe(2200);
    });

    it('throws when the client does not exist', async () => {
      clientRepo.findById.mockResolvedValue(null);

      await expect(service.savePlan(999, input)).rejects.toThrow(ClientNotFoundError);
      expect(nutritionRepo.upsert).not.toHaveBeenCalled();
    });
  });

  describe('getVersions', () => {
    it('returns the version history', async () => {
      clientRepo.findById.mockResolvedValue(makeClient());
      nutritionRepo.listVersionsByClientId.mockResolvedValue([
        { id: 2, snapshot: {}, createdAt: new Date('2026-09-21T11:00:00.000Z') },
        { id: 1, snapshot: {}, createdAt: new Date('2026-09-21T10:00:00.000Z') },
      ]);

      const result = await service.getVersions(10);

      expect(result[0].id).toBe(2);
    });

    it('throws when the client does not exist', async () => {
      clientRepo.findById.mockResolvedValue(null);

      await expect(service.getVersions(999)).rejects.toThrow(ClientNotFoundError);
    });
  });
});
