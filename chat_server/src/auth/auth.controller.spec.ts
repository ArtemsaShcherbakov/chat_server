import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    login: jest.fn(),
    register: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
  };
  const authResult = {
    accessToken: 'access',
    refreshToken: 'refresh',
    user: { id: 1, name: 'artem', email: 'artem@example.com' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();
    controller = moduleRef.get(AuthController);
  });

  it('wraps the login result in { data, error }', async () => {
    authService.login.mockResolvedValue(authResult);

    await expect(
      controller.login({ name: 'artem', password: 'secret123' }),
    ).resolves.toEqual({ data: authResult, error: null });
  });

  it('propagates login failures for the exception filter', async () => {
    authService.login.mockRejectedValue(new UnauthorizedException());

    await expect(
      controller.login({ name: 'artem', password: 'wrong1234' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns null data on logout', async () => {
    await expect(
      controller.logout({ refreshToken: 'refresh' }),
    ).resolves.toEqual({ data: null, error: null });
    expect(authService.logout).toHaveBeenCalledWith('refresh');
  });
});
