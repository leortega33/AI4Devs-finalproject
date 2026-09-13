import { NextFunction, Request, Response } from 'express';
import { AuthService, InvalidCredentialsError, InvalidResetTokenError } from '../../application/services/authService';
import { validateLogin, validateForgotPassword, validateResetPassword } from '../../application/validator';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';

const SESSION_COOKIE = 'session';
const SESSION_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, matches the JWT expiry

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: SESSION_COOKIE_MAX_AGE_MS,
  };
}

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = validateLogin(req.body);
      const { user, token } = await this.authService.login(email, password);
      res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        res.status(401).json({ success: false, error: { message: error.message, code: 'INVALID_CREDENTIALS' } });
        return;
      }
      next(error);
    }
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie(SESSION_COOKIE);
    res.status(204).send();
  };

  me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    res.status(200).json({ success: true, data: req.user });
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = validateForgotPassword(req.body);
      await this.authService.requestPasswordReset(email);
      res.status(200).json({ success: true, message: 'If the email matches an account, a reset link was sent.' });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = validateResetPassword(req.body);
      await this.authService.resetPassword(token, newPassword);
      res.status(200).json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
      if (error instanceof InvalidResetTokenError) {
        res.status(400).json({ success: false, error: { message: error.message, code: 'INVALID_RESET_TOKEN' } });
        return;
      }
      next(error);
    }
  };
}
