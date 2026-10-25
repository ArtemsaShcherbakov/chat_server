import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { IsNull, Repository } from 'typeorm';
import { authConfig } from '../config/configuration';
import { Users } from '../entities';
import {
  ACCOUNT_LOCKED_MESSAGE,
  BCRYPT_ROUNDS,
  INVALID_CREDENTIALS_MESSAGE,
  INVALID_REFRESH_TOKEN_MESSAGE,
  LOCK_DURATION_MS,
  MAX_FAILED_LOGIN_ATTEMPTS,
} from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Tokens } from './entities/tokens.entity';

export interface PublicUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

export interface JwtPayload {
  sub: number;
  name: string;
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

const toPublicUser = ({ id, name, email }: Users): PublicUser => ({
  id,
  name,
  email,
});

@Injectable()
export class AuthService {
  // Compared against when the user does not exist, so response time does not reveal it
  private dummyHash?: Promise<string>;

  constructor(
    @InjectRepository(Users) private readonly users: Repository<Users>,
    @InjectRepository(Tokens) private readonly tokens: Repository<Tokens>,
    private readonly jwt: JwtService,
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.users.findOne({
      where: [{ name: dto.name }, { email: dto.email }],
    });

    if (existing) {
      throw new ConflictException('User name or email is already taken');
    }

    const user = await this.users.save(
      this.users.create({
        name: dto.name,
        email: dto.email,
        password_hash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
      }),
    );

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.users.findOne({
      where: { name: dto.name },
      select: {
        id: true,
        name: true,
        email: true,
        password_hash: true,
        failed_login_attempts: true,
        locked_until: true,
      },
    });

    if (!user) {
      this.dummyHash ??= bcrypt.hash(
        randomBytes(16).toString('hex'),
        BCRYPT_ROUNDS,
      );

      await bcrypt.compare(dto.password, await this.dummyHash);

      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const now = Date.now();

    if (user.locked_until && user.locked_until.getTime() > now) {
      throw new HttpException(ACCOUNT_LOCKED_MESSAGE, HttpStatus.LOCKED);
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );

    if (!passwordMatches) {
      const attempts = user.failed_login_attempts + 1;

      if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
        await this.users.update(user.id, {
          failed_login_attempts: 0,
          locked_until: new Date(now + LOCK_DURATION_MS),
        });

        throw new HttpException(ACCOUNT_LOCKED_MESSAGE, HttpStatus.LOCKED);
      }

      await this.users.update(user.id, { failed_login_attempts: attempts });

      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    if (user.failed_login_attempts > 0 || user.locked_until) {
      await this.users.update(user.id, {
        failed_login_attempts: 0,
        locked_until: null,
      });
    }
    return this.issueTokens(user);
  }

  // Rotates the refresh token: the old one is revoked and a new pair is issued
  async refresh(refreshToken: string): Promise<AuthResult> {
    const token = await this.tokens.findOne({
      where: { token_hash: hashToken(refreshToken), revoked_dt: IsNull() },
      relations: { user: true },
    });
    if (!token || token.expires_dt.getTime() <= Date.now()) {
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
    }

    await this.tokens.update(token.id, { revoked_dt: new Date() });
    return this.issueTokens(token.user);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokens.update(
      { token_hash: hashToken(refreshToken), revoked_dt: IsNull() },
      { revoked_dt: new Date() },
    );
  }

  async getProfile(userId: number): Promise<PublicUser> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return toPublicUser(user);
  }

  private async issueTokens(user: Users): Promise<AuthResult> {
    const payload: JwtPayload = { sub: user.id, name: user.name };

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: this.config.accessTokenTtlSeconds,
    });

    const refreshToken = randomBytes(48).toString('base64url');

    await this.tokens.save(
      this.tokens.create({
        user_id: user.id,
        token_hash: hashToken(refreshToken),
        expires_dt: new Date(
          Date.now() + this.config.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
        ),
      }),
    );

    return { accessToken, refreshToken, user: toPublicUser(user) };
  }
}
