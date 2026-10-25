import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { FindOperator } from 'typeorm';
import { MAX_FAILED_LOGIN_ATTEMPTS } from '../src/auth/auth.constants';
import { AuthModule } from '../src/auth/auth.module';
import type { AuthResult, PublicUser } from '../src/auth/auth.service';
import { Tokens } from '../src/auth/entities/tokens.entity';
import { authConfig } from '../src/config/configuration';
import { Users } from '../src/entities';
import { SharedModule } from '../src/shared/shared.module';

type Row = Record<string, unknown> & { id: number };
type Where = Record<string, unknown>;

interface ApiBody<T> {
  data: T | null;
  error: { statusCode: number; message: string; details?: string[] } | null;
}

const bodyOf = <T>(res: { body: unknown }) => res.body as ApiBody<T>;

// Minimal in-memory stand-in for a TypeORM repository, enough for AuthService
class InMemoryRepository {
  rows: Row[] = [];
  constructor(
    private readonly relations: Record<string, () => Row[]> = {},
    // Column defaults that Postgres would fill in on insert
    private readonly defaults: Partial<Row> = {},
  ) {}

  private matches(row: Row, where: Where) {
    return Object.entries(where).every(([key, value]) => {
      if (value instanceof FindOperator && value.type === 'isNull') {
        return row[key] == null;
      }
      return row[key] === value;
    });
  }

  findOne({
    where,
    relations = {},
  }: {
    where: Where | Where[];
    relations?: Record<string, boolean>;
  }) {
    const filters = Array.isArray(where) ? where : [where];
    const row = this.rows.find((r) => filters.some((f) => this.matches(r, f)));
    if (!row) return Promise.resolve(null);
    const result: Row = { ...row };
    for (const name of Object.keys(relations)) {
      result[name] = this.relations[name]().find(
        (r) => r.id === row[`${name}_id`],
      );
    }
    return Promise.resolve(result);
  }

  create(value: Partial<Row>) {
    return value;
  }

  save(value: Partial<Row>) {
    const row = { id: this.rows.length + 1, ...this.defaults, ...value } as Row;
    this.rows.push(row);
    return Promise.resolve(row);
  }

  update(criteria: number | Where, patch: Partial<Row>) {
    const where = typeof criteria === 'number' ? { id: criteria } : criteria;
    this.rows
      .filter((r) => this.matches(r, where))
      .forEach((r) => Object.assign(r, patch));
    return Promise.resolve();
  }
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let users: InMemoryRepository;

  const credentials = { name: 'artem', password: 'secret123' };

  // bcrypt with production cost is intentionally slow
  jest.setTimeout(30_000);

  beforeEach(async () => {
    process.env.JWT_SECRET = 'e2e-secret-that-is-at-least-32-chars-long';
    users = new InMemoryRepository(
      {},
      { failed_login_attempts: 0, locked_until: null },
    );
    const tokens = new InMemoryRepository({ user: () => users.rows });

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [authConfig],
        }),
        SharedModule,
        AuthModule,
      ],
    })
      .overrideProvider(getRepositoryToken(Users))
      .useValue(users)
      .overrideProvider(getRepositoryToken(Tokens))
      .useValue(tokens)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...credentials, email: 'artem@example.com' })
      .expect(201);
  });

  afterEach(async () => {
    await app.close();
  });

  function login(body: object) {
    return request(app.getHttpServer()).post('/auth/login').send(body);
  }

  it('logs in with valid credentials and reaches a protected route', async () => {
    const res = bodyOf<AuthResult>(await login(credentials).expect(200));

    expect(res.error).toBeNull();
    expect(res.data?.user).toEqual({
      id: 1,
      name: 'artem',
      email: 'artem@example.com',
    });

    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${res.data?.accessToken}`)
      .expect(200);
    expect(bodyOf<PublicUser>(me).data?.name).toBe('artem');
  });

  it('never stores the password in plain text', () => {
    expect(users.rows[0].password_hash).not.toBe(credentials.password);
    expect(JSON.stringify(users.rows)).not.toContain(credentials.password);
  });

  it('returns the same generic error for a wrong password and an unknown user', async () => {
    const wrongPassword = await login({
      ...credentials,
      password: 'wrong1234',
    }).expect(401);
    const unknownUser = await login({ ...credentials, name: 'ghost' }).expect(
      401,
    );

    expect(wrongPassword.body).toEqual(unknownUser.body);
    expect(wrongPassword.body).toEqual({
      data: null,
      error: { statusCode: 401, message: 'Invalid user name or password' },
    });
  });

  it('locks the account after 5 consecutive failures', async () => {
    for (let i = 1; i < MAX_FAILED_LOGIN_ATTEMPTS; i++) {
      await login({ ...credentials, password: 'wrong1234' }).expect(401);
    }
    await login({ ...credentials, password: 'wrong1234' }).expect(423);

    // Correct password is refused while locked
    await login(credentials).expect(423);
  });

  it('rejects invalid input with validation details', async () => {
    const res = bodyOf<null>(
      await login({ name: 'a!', password: 'short' }).expect(400),
    );

    expect(res.data).toBeNull();
    expect(res.error?.message).toBe('Validation failed');
    expect(res.error?.details?.length).toBeGreaterThan(0);
  });

  it('rotates refresh tokens and rejects reuse of the old one', async () => {
    const res = bodyOf<AuthResult>(await login(credentials).expect(200));
    const oldToken = res.data?.refreshToken;

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: oldToken })
      .expect(200);
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: oldToken })
      .expect(401);
  });
});
