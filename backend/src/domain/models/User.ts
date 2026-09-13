export interface UserProps {
  id?: number;
  email: string;
  passwordHash: string;
  passwordResetTokenHash?: string | null;
  passwordResetExpiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Single admin account entity (see docs/data-model.md). */
export class User {
  readonly id?: number;
  readonly email: string;
  readonly passwordHash: string;
  readonly passwordResetTokenHash: string | null;
  readonly passwordResetExpiresAt: Date | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.passwordResetTokenHash = props.passwordResetTokenHash ?? null;
    this.passwordResetExpiresAt = props.passwordResetExpiresAt ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /** True when a reset token exists and has not expired yet. */
  hasValidPasswordResetToken(now: Date = new Date()): boolean {
    return (
      this.passwordResetTokenHash !== null &&
      this.passwordResetExpiresAt !== null &&
      this.passwordResetExpiresAt.getTime() > now.getTime()
    );
  }
}
