import { HttpStatus, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { authConfig } from '../config/configuration';
import { Users } from '../entities';
import {
  ACCOUNT_LOCKED_MESSAGE,
  INVALID_CREDENTIALS_MESSAGE,
  LOCK_DURATION_MS,
  MAX_FAILED_LOGIN_ATTEMPTS,
} from './auth.constants';
import { AuthService } from './auth.service';
import { Tokens } from './entities/tokens.entity';

const PASSWORD = 'secret123';

function saveUser(value: Partial<Users>) {
  return Promise.resolve({ id: 1, ...value });
}

describe('AuthService', () => {
  let service: AuthService;
  let passwordHash: string;
  const users = {
    findOne: jest.fn(),
    create: jest.fn((value: Partial<Users>) => value),
    save: jest.fn(saveUser),
    update: jest.fn(),
  };
  const tokens = {
    findOne: jest.fn(),
    create: jest.fn((value: Partial<Tokens>) => value),
    save: jest.fn((value: Partial<Tokens>) => Promise.resolve(value)),
    update: jest.fn(),
  };

  const storedUser = (overrides: Partial<Users> = {}): Partial<Users> => ({
    id: 1,
    name: 'artem',
    email: 'artem@example.com',
    password_hash: passwordHash,
    failed_login_attempts: 0,
    locked_until: null,
    ...overrides,
  });

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(PASSWORD, 4);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(Users), useValue: users },
        { provide: getRepositoryToken(Tokens), useValue: tokens },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('access-token') },
        },
        {
          provide: authConfig.KEY,
          useValue: {
            jwtSecret: 'test',
            accessTokenTtlSeconds: 900,
            refreshTokenTtlDays: 30,
          },
        },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  describe('login', () => {
    it('returns tokens and the public user for valid credentials', async () => {
      users.findOne.mockResolvedValue(storedUser());

      const result = await service.login({ name: 'artem', password: PASSWORD });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toEqual(expect.any(String));
      expect(result.user).toEqual({
        id: 1,
        name: 'artem',
        email: 'artem@example.com',
      });
      const saved = tokens.save.mock.calls[0][0];
      expect(saved.user_id).toBe(1);
      expect(saved.token_hash).not.toContain(result.refreshToken);
    });

    it('rejects an unknown user with the generic message', async () => {
      users.findOne.mockResolvedValue(null);

      await expect(
        service.login({ name: 'ghost', password: PASSWORD }),
      ).rejects.toThrow(new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE));
    });

    it('rejects a wrong password with the same generic message and counts the attempt', async () => {
      users.findOne.mockResolvedValue(storedUser({ failed_login_attempts: 2 }));

      await expect(
        service.login({ name: 'artem', password: 'wrong1234' }),
      ).rejects.toThrow(new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE));
      expect(users.update).toHaveBeenCalledWith(1, {
        failed_login_attempts: 3,
      });
    });

    it('locks the account for 15 minutes on the 5th consecutive failure', async () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);
      users.findOne.mockResolvedValue(
        storedUser({ failed_login_attempts: MAX_FAILED_LOGIN_ATTEMPTS - 1 }),
      );

      await expect(
        service.login({ name: 'artem', password: 'wrong1234' }),
      ).rejects.toMatchObject({
        message: ACCOUNT_LOCKED_MESSAGE,
        status: HttpStatus.LOCKED,
      });
      expect(users.update).toHaveBeenCalledWith(1, {
        failed_login_attempts: 0,
        locked_until: new Date(now + LOCK_DURATION_MS),
      });
      jest.restoreAllMocks();
    });

    it('rejects even the correct password while the account is locked', async () => {
      users.findOne.mockResolvedValue(
        storedUser({ locked_until: new Date(Date.now() + 60_000) }),
      );

      await expect(
        service.login({ name: 'artem', password: PASSWORD }),
      ).rejects.toMatchObject({ status: HttpStatus.LOCKED });
      expect(tokens.save).not.toHaveBeenCalled();
    });

    it('allows login after the lock expires and resets the counter', async () => {
      users.findOne.mockResolvedValue(
        storedUser({
          failed_login_attempts: 0,
          locked_until: new Date(Date.now() - 1000),
        }),
      );

      await service.login({ name: 'artem', password: PASSWORD });

      expect(users.update).toHaveBeenCalledWith(1, {
        failed_login_attempts: 0,
        locked_until: null,
      });
    });
  });

  describe('register', () => {
    it('stores a bcrypt hash, never the plain password', async () => {
      users.findOne.mockResolvedValue(null);

      await service.register({
        name: 'artem',
        email: 'artem@example.com',
        password: PASSWORD,
      });

      const saved = users.save.mock.calls[0][0];
      expect(saved.password_hash).not.toBe(PASSWORD);
      expect(await bcrypt.compare(PASSWORD, saved.password_hash!)).toBe(true);
    });

    it('rejects a taken user name or email', async () => {
      users.findOne.mockResolvedValue(storedUser());

      await expect(
        service.register({
          name: 'artem',
          email: 'other@example.com',
          password: PASSWORD,
        }),
      ).rejects.toMatchObject({ status: HttpStatus.CONFLICT });
    });
  });

  describe('refresh', () => {
    it('revokes the used token and issues a new pair', async () => {
      tokens.findOne.mockResolvedValue({
        id: 7,
        expires_dt: new Date(Date.now() + 60_000),
        user: storedUser(),
      });

      const result = await service.refresh('old-token');

      const [revokedId, patch] = tokens.update.mock.calls[0] as [
        number,
        Partial<Tokens>,
      ];
      expect(revokedId).toBe(7);
      expect(patch.revoked_dt).toBeInstanceOf(Date);
      expect(result.accessToken).toBe('access-token');
    });

    it('rejects an expired token', async () => {
      tokens.findOne.mockResolvedValue({
        id: 7,
        expires_dt: new Date(Date.now() - 1000),
        user: storedUser(),
      });

      await expect(service.refresh('old-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
