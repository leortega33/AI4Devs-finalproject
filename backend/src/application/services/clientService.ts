import { Client, ClientStatus } from '../../domain/models/Client';
import {
  ClientRepository,
  ClientInput,
  ClientListFilters,
} from '../../domain/repositories/ClientRepository';

export class ClientNotFoundError extends Error {
  constructor() {
    super('Client not found');
    this.name = 'ClientNotFoundError';
  }
}

export class DuplicateDniError extends Error {
  constructor() {
    super('A client with this DNI already exists');
    this.name = 'DuplicateDniError';
  }
}

/** Business logic for gym client management (see US-002). */
export class ClientService {
  constructor(private readonly clientRepository: ClientRepository) {}

  async create(data: ClientInput): Promise<Client> {
    const existing = await this.clientRepository.findByDni(data.dni);
    if (existing) {
      throw new DuplicateDniError();
    }
    return this.clientRepository.create(data);
  }

  async findById(id: number): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new ClientNotFoundError();
    }
    return client;
  }

  async list(filters: ClientListFilters): Promise<Client[]> {
    return this.clientRepository.findAll(filters);
  }

  async update(id: number, data: ClientInput): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new ClientNotFoundError();
    }
    const dniOwner = await this.clientRepository.findByDni(data.dni);
    if (dniOwner && dniOwner.id !== id) {
      throw new DuplicateDniError();
    }
    return this.clientRepository.update(id, data);
  }

  async setStatus(id: number, status: ClientStatus): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new ClientNotFoundError();
    }
    return this.clientRepository.setStatus(id, status);
  }
}
