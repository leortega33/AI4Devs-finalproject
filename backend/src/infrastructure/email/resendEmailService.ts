import { EmailService } from './emailService';

export interface ResendEmailServiceOptions {
  apiKey: string;
  fromEmail: string;
}

/**
 * Sends transactional emails through the Resend API (https://resend.com).
 * The API key is provided via configuration and never committed.
 */
export class ResendEmailService implements EmailService {
  constructor(private readonly options: ResendEmailServiceOptions) {
    if (!options.apiKey) {
      throw new Error('ResendEmailService requires an API key');
    }
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    await this.sendEmail(
      to,
      'Restablecer contraseña',
      `Usá este enlace para restablecer tu contraseña: ${resetUrl}`,
    );
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.options.fromEmail,
        to,
        subject,
        text: body,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend request failed with status ${response.status}`);
    }
  }
}
