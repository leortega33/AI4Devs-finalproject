export type ClientStatus = 'active' | 'inactive';

export interface EmergencyContact {
  name?: string | null;
  phone?: string | null;
  relationship?: string | null;
}

export interface ClientProps {
  id?: number;
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
  joinDate?: Date;
  status?: ClientStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Gym client entity (see docs/data-model.md entity #2). */
export class Client {
  readonly id?: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly dni: string;
  readonly phone: string;
  readonly email: string;
  readonly birthDate: Date;
  readonly address: string | null;
  readonly goal: string | null;
  readonly emergencyContactName: string | null;
  readonly emergencyContactPhone: string | null;
  readonly emergencyContactRelationship: string | null;
  readonly joinDate?: Date;
  readonly status: ClientStatus;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: ClientProps) {
    this.id = props.id;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.dni = props.dni;
    this.phone = props.phone;
    this.email = props.email;
    this.birthDate = props.birthDate;
    this.address = props.address ?? null;
    this.goal = props.goal ?? null;
    this.emergencyContactName = props.emergencyContactName ?? null;
    this.emergencyContactPhone = props.emergencyContactPhone ?? null;
    this.emergencyContactRelationship = props.emergencyContactRelationship ?? null;
    this.joinDate = props.joinDate;
    this.status = props.status ?? 'active';
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isActive(): boolean {
    return this.status === 'active';
  }
}
