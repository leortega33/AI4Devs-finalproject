import jwt from 'jsonwebtoken';
import { createAuthMiddleware, AuthenticatedRequest } from './authMiddleware';

const JWT_SECRET = 'test-secret';

function buildResponseMock() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authMiddleware', () => {
  const middleware = createAuthMiddleware(JWT_SECRET);

  it('should reject when no session cookie is present', () => {
    const req = { cookies: {} } as unknown as AuthenticatedRequest;
    const res = buildResponseMock();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject an invalid token', () => {
    const req = { cookies: { session: 'not-a-valid-token' } } as unknown as AuthenticatedRequest;
    const res = buildResponseMock();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject an expired token', () => {
    const expiredToken = jwt.sign({ sub: 1 }, JWT_SECRET, { expiresIn: -10 });
    const req = { cookies: { session: expiredToken } } as unknown as AuthenticatedRequest;
    const res = buildResponseMock();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should attach req.user and call next for a valid token', () => {
    const validToken = jwt.sign({ sub: 1 }, JWT_SECRET, { expiresIn: '1h' });
    const req = { cookies: { session: validToken } } as unknown as AuthenticatedRequest;
    const res = buildResponseMock();
    const next = jest.fn();

    middleware(req, res, next);

    expect(req.user).toEqual({ id: 1 });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
