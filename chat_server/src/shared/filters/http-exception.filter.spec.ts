import {
  ArgumentsHost,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;

  beforeEach(() => jest.clearAllMocks());

  it('wraps an HttpException in { data: null, error }', () => {
    filter.catch(new UnauthorizedException('Nope'), host);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      data: null,
      error: { statusCode: 401, message: 'Nope' },
    });
  });

  it('exposes validation messages as details', () => {
    filter.catch(new BadRequestException(['name is too short']), host);

    expect(json).toHaveBeenCalledWith({
      data: null,
      error: {
        statusCode: 400,
        message: 'Validation failed',
        details: ['name is too short'],
      },
    });
  });

  it('hides internals of unknown errors', () => {
    jest.spyOn(filter['logger'], 'error').mockImplementation(() => undefined);

    filter.catch(new Error('db password is hunter2'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      data: null,
      error: { statusCode: 500, message: 'Internal server error' },
    });
  });
});
