import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

/** Verifies the session JWT cookie and attaches req.user; protects every non-auth route. */
export function createAuthMiddleware(jwtSecret: string) {
  return function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const token = req.cookies?.session;
    if (!token) {
      res.status(401).json({ success: false, error: { message: 'Not authenticated', code: 'UNAUTHENTICATED' } });
      return;
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as unknown as { sub: number };
      req.user = { id: decoded.sub };
      next();
    } catch {
      res.status(401).json({ success: false, error: { message: 'Not authenticated', code: 'UNAUTHENTICATED' } });
    }
  };
}
