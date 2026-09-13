import { Client } from './Client';

describe('Client', () => {
  const baseProps = {
    firstName: 'John',
    lastName: 'Doe',
    dni: '12345678',
    phone: '+542604000000',
    email: 'john@example.com',
    birthDate: new Date('1990-01-01'),
  };

  it('should default status to active and optional fields to null', () => {
    const client = new Client(baseProps);

    expect(client.status).toBe('active');
    expect(client.isActive()).toBe(true);
    expect(client.address).toBeNull();
    expect(client.emergencyContactName).toBeNull();
  });

  it('should expose the full name', () => {
    const client = new Client(baseProps);

    expect(client.fullName).toBe('John Doe');
  });

  it('should report inactive status correctly', () => {
    const client = new Client({ ...baseProps, status: 'inactive' });

    expect(client.isActive()).toBe(false);
  });
});
