import { NextFunction, Request, Response } from 'express';
import { requireHttps } from './require-https.middleware';

describe('requireHttps', () => {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const res = { status } as unknown as Response;
  const next: NextFunction = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('passes secure requests through', () => {
    requireHttps({ secure: true } as Request, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('rejects plain HTTP requests', () => {
    requireHttps({ secure: false } as Request, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(403);
  });
});
