import { Client, ClientStatus } from '../models/Client';

export interface ClientListFilters {
  search?: string;
  status?: ClientStatus;
}

/** Input data for creating or updating a client (basic data only, no id/status). */
export interface ClientInput {
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string;
  birthDate: Date;
  address?: string | null;
  goal?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelationship?: string | null;
}

/** Data access contract for gym clients (see docs/backend-standards.md). */
export interface ClientRepository {
  create(data: ClientInput): Promise<Client>;
  findById(id: number): Promise<Client | null>;
  findByDni(dni: string): Promise<Client | null>;
  findAll(filters: ClientListFilters): Promise<Client[]>;
  update(id: number, data: ClientInput): Promise<Client>;
  setStatus(id: number, status: ClientStatus): Promise<Client>;
}
