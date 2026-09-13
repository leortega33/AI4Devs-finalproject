import { errorHandler } from './errorHandler';
import { ValidationError } from '../application/validator';

function buildResponseMock() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler', () => {
  it('should map a ValidationError to a 400 response', () => {
    const res = buildResponseMock();

    errorHandler(new ValidationError('bad input'), {} as any, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'bad input', code: 'VALIDATION_ERROR' },
    });
  });

  it('should map an unexpected error to a 500 response', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = buildResponseMock();

    errorHandler(new Error('boom'), {} as any, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
    });
    errorSpy.mockRestore();
  });
});
