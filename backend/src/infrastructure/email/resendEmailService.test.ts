import { ResendEmailService } from './resendEmailService';

describe('ResendEmailService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('should require an API key', () => {
    expect(() => new ResendEmailService({ apiKey: '', fromEmail: 'no-reply@example.com' })).toThrow();
  });

  it('should POST the email payload to the Resend API', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    global.fetch = fetchMock as unknown as typeof fetch;
    const service = new ResendEmailService({ apiKey: 'key_123', fromEmail: 'no-reply@example.com' });

    await service.sendEmail('ana@example.com', 'Recordatorio', 'Tenés un pago vencido.');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer key_123' }),
      }),
    );
    const body = JSON.parse((fetchMock.mock.calls[0][1] as { body: string }).body);
    expect(body).toEqual({
      from: 'no-reply@example.com',
      to: 'ana@example.com',
      subject: 'Recordatorio',
      text: 'Tenés un pago vencido.',
    });
  });

  it('should throw when the Resend API responds with an error', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 422 }) as unknown as typeof fetch;
    const service = new ResendEmailService({ apiKey: 'key_123', fromEmail: 'no-reply@example.com' });

    await expect(service.sendEmail('ana@example.com', 'x', 'y')).rejects.toThrow('422');
  });
});
