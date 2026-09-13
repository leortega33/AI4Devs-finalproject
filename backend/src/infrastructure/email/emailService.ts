/** Abstraction over the password-reset email provider (see design.md - open question: provider TBD). */
export interface EmailService {
  sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>;
}

/** Development fallback: logs the reset link instead of sending a real email. */
export class ConsoleEmailService implements EmailService {
  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[email:dev] Password reset link for ${to}: ${resetUrl}`);
  }
}
