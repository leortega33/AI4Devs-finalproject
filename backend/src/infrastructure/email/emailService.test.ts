import { ConsoleEmailService } from './emailService';

describe('ConsoleEmailService', () => {
  it('should log the reset link for the given recipient', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const service = new ConsoleEmailService();

    await service.sendPasswordResetEmail('admin@example.com', 'http://localhost/reset?token=abc');

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('admin@example.com'),
    );
    logSpy.mockRestore();
  });

  it('should log an arbitrary email (subject + body)', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const service = new ConsoleEmailService();

    await service.sendEmail('ana@example.com', 'Recordatorio de pago', 'Tenés un pago vencido.');

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('ana@example.com'),
    );
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Recordatorio de pago'));
    logSpy.mockRestore();
  });
});
