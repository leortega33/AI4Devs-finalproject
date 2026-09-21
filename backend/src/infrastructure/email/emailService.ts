/** Abstraction over the transactional email provider (password reset + reminders). */
export interface EmailService {
  sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>;
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

/** Development fallback: logs emails instead of sending them. */
export class ConsoleEmailService implements EmailService {
  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    await this.sendEmail(to, 'Password reset', `Password reset link: ${resetUrl}`);
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[email:dev] To: ${to} | Subject: ${subject}\n${body}`);
  }
}
