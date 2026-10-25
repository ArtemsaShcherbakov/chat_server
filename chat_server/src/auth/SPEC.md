# Auth module — backend specification

Login, registration and session tokens for `chat_server`.
Original product requirements: [auth.md](./auth.md). Client counterpart: [chat_client/src/features/auth/SPEC.md](../../../chat_client/src/features/auth/SPEC.md).

This document describes **how the module works today** and the **rules to keep when changing it**. If code and this spec disagree, fix one of them in the same change.

---

## 1. File map

| Path | Role |
| --- | --- |
| `auth.module.ts` | Wires TypeORM repos (`Users`, `Tokens`), Passport, JWT |
| `auth.controller.ts` | HTTP routes under `/auth`, wraps results in `{ data, error }` |
| `auth.service.ts` | All business logic: register, login + lockout, refresh, logout, profile |
| `auth.constants.ts` | Limits, lockout settings, user-facing error messages |
| `dto/login.dto.ts` | `name`, `password` validation + `trimLowercase` transform |
| `dto/register.dto.ts` | `LoginDto` + `email` |
| `dto/refresh-token.dto.ts` | `refreshToken` |
| `entities/tokens.entity.ts` | Refresh tokens (table `token`) |
| `strategies/jwt.strategy.ts` | Validates `Authorization: Bearer <accessToken>` |
| `guards/jwt-auth.guard.ts` | `@UseGuards(JwtAuthGuard)` for protected routes |
| `../entities/users.entity.ts` | Shared `Users` entity (table `user`) |
| `../shared/decorators/current-user.decorator.ts` | `@CurrentUser()` → `{ id, name }` from the JWT |
| `../shared/filters/http-exception.filter.ts` | Turns every exception into `{ data: null, error }` |
| `../shared/middleware/require-https.middleware.ts` | Rejects plain HTTP in production |
| `../config/configuration.ts`, `../config/env.validation.ts` | Typed config + Joi env validation |
| `../database/entities.ts` | Single entity list for the app and the TypeORM CLI |

---

## 2. Data model

### `user` (entity `Users`, shared)

| Column | Type | Notes |
| --- | --- | --- |
| `id` | serial PK | |
| `name` | varchar, **unique** | Stored lowercase (see §4) |
| `email` | varchar, **unique** | Stored lowercase |
| `password_hash` | varchar | bcrypt, cost 12. `select: false` — must be selected explicitly |
| `failed_login_attempts` | int, default 0 | Consecutive failures since last success/lock |
| `locked_until` | timestamptz, nullable | Login refused while `> now()` |

### `token` (entity `Tokens`, auth module only)

| Column | Type | Notes |
| --- | --- | --- |
| `id` | serial PK | |
| `user_id` | FK → `user.id`, `ON DELETE CASCADE` | |
| `token_hash` | varchar, **unique index** | SHA-256 hex of the refresh token. Raw token is never stored |
| `expires_dt` | timestamptz | `created + REFRESH_TOKEN_TTL_DAYS` |
| `revoked_dt` | timestamptz, nullable | Set on refresh (rotation) and logout |
| `created_dt` | timestamptz | |

Schema is created by `synchronize` outside production. **No migrations exist yet** — generate them before the first production deploy (`src/database/data-source.ts`).

---

## 3. HTTP API

All routes return the envelope `{ data, error }` (project rule, see `CLAUDE.md`).

```jsonc
// success
{ "data": { ... }, "error": null }
// failure
{ "data": null, "error": { "statusCode": 401, "message": "Invalid user name or password" } }
// validation failure (400) also carries details
{ "data": null, "error": { "statusCode": 400, "message": "Validation failed", "details": ["name must be ..."] } }
```

Unknown fields in a body are rejected (`ValidationPipe` with `whitelist` + `forbidNonWhitelisted`). Unhandled errors return `500` with message `Internal server error`; internals are only logged.

### Endpoints

| Method & path | Auth | Body | Success | Errors |
| --- | --- | --- | --- | --- |
| `POST /auth/register` | — | `{ name, email, password }` | `201` `AuthResult` | `400` validation, `409` name or email taken |
| `POST /auth/login` | — | `{ name, password }` | `200` `AuthResult` | `400`, `401` invalid credentials, `423` locked |
| `POST /auth/refresh` | — | `{ refreshToken }` | `200` `AuthResult` (new pair) | `400`, `401` invalid/expired/revoked |
| `POST /auth/logout` | — | `{ refreshToken }` | `200` `data: null` | `400` |
| `GET /auth/me` | Bearer | — | `200` `PublicUser` | `401` |

```ts
type PublicUser = { id: number; name: string; email: string };
type AuthResult = { accessToken: string; refreshToken: string; user: PublicUser };
```

`password_hash`, `failed_login_attempts` and `locked_until` must never appear in a response — always go through `toPublicUser()`.

---

## 4. Validation and normalization

Defined in `auth.constants.ts`, applied by the DTOs.

| Field | Rule |
| --- | --- |
| `name` | trimmed + lowercased, then 2–32 chars, `^[a-z0-9._-]+$` |
| `email` | trimmed + lowercased, then `@IsEmail()` |
| `password` | 8–12 chars, at least one letter and one digit. Not trimmed |

Because of normalization, `"  Artem "` and `"artem"` are the same account.

> **Sync rule:** these limits are duplicated in `chat_client/src/features/auth/validation.ts`. Change both in the same commit, plus `dto/login.dto.spec.ts`.

---

## 5. Business rules

### Registration
1. Reject with `409` if **either** name or email exists. The message does not say which one (`User name or email is already taken`).
2. Hash the password with bcrypt (`BCRYPT_ROUNDS = 12`) and save the user.
3. Issue a token pair — the user is signed in immediately.

### Login
1. Load the user by normalized `name`, explicitly selecting `password_hash`, `failed_login_attempts`, `locked_until`.
2. **Unknown user:** run a bcrypt compare against a lazily created dummy hash (equalizes response time), then `401` with the generic message.
3. **Locked** (`locked_until > now`): `423` with `ACCOUNT_LOCKED_MESSAGE`. The password is not checked and the counter is not touched.
4. **Wrong password:** `attempts = failed_login_attempts + 1`.
   - `attempts >= 5` → set `locked_until = now + 15 min`, reset counter to `0`, respond `423`.
   - otherwise store `attempts`, respond `401` with the generic message.
5. **Correct password:** if the counter or lock is set, reset both; issue a token pair.

Wrong password and unknown user must produce **byte-identical** responses (covered by e2e).

### Tokens
| Token | Format | Lifetime | Storage |
| --- | --- | --- | --- |
| Access | JWT (HS256, `JWT_SECRET`), payload `{ sub: userId, name }` | `JWT_ACCESS_TTL_SECONDS` (default 900) | Not stored |
| Refresh | 48 random bytes, base64url | `REFRESH_TOKEN_TTL_DAYS` (default 30) | SHA-256 in `token` |

- **Refresh** accepts only a non-revoked, non-expired token; it revokes the used token and issues a new pair (rotation). Reusing an old token → `401`.
- **Logout** revokes the given token if it is active. It always returns `200`, even for an unknown token.
- **`/auth/me`** trusts the JWT for `id`, then reloads the user from the DB.

---

## 6. Security requirements

- Passwords are only ever stored as bcrypt hashes; never log request bodies (`LoggingInterceptor` logs method, path and duration only).
- In `NODE_ENV=production`, plain-HTTP requests get `403 HTTPS is required`. Behind a TLS-terminating proxy set `TRUST_PROXY=true`; for direct TLS set `HTTPS_KEY_PATH` + `HTTPS_CERT_PATH`.
- `JWT_SECRET` is required and at least 32 chars; the app refuses to start otherwise.
- Do not distinguish "user not found" from "wrong password" anywhere (message, status, timing).

---

## 7. Configuration

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | yes | — | Postgres |
| `JWT_SECRET` | yes | — | Access token signing, ≥ 32 chars |
| `JWT_ACCESS_TTL_SECONDS` | no | `900` | Access token lifetime |
| `REFRESH_TOKEN_TTL_DAYS` | no | `30` | Refresh token lifetime |
| `NODE_ENV` | no | `development` | `production` enables HTTPS enforcement, disables `synchronize` |
| `PORT` | no | `3000` | |
| `TRUST_PROXY` | no | `false` | Trust `X-Forwarded-Proto` |
| `HTTPS_KEY_PATH`, `HTTPS_CERT_PATH` | no (both or none) | — | Serve TLS directly |

---

## 8. Tests

| File | Covers |
| --- | --- |
| `auth.service.spec.ts` | Login success, generic errors, attempt counting, lock on 5th failure, locked rejects correct password, lock expiry, bcrypt storage, register conflict, refresh rotation/expiry |
| `auth.controller.spec.ts` | Envelope shape, error propagation |
| `dto/login.dto.spec.ts` | Normalization, length/charset/complexity limits incl. boundaries |
| `test/auth.e2e-spec.ts` | Full HTTP flow with in-memory repositories (no DB needed): login → `/me`, identical 401s, lockout → 423, validation 400, refresh reuse → 401 |
| `../shared/**/*.spec.ts` | Exception filter, HTTPS middleware |

```bash
pnpm run test       # unit
pnpm run test:e2e   # e2e
pnpm run lint
```

Every behaviour change needs a test for the happy path and at least one failure case (`CLAUDE.md`).

---

## 9. Rules for changing this module

- Keep the `{ data, error }` envelope; throw Nest `HttpException`s and let the filter format them.
- New user-facing messages go into `auth.constants.ts`. The client maps errors by **status code**, not by message — changing a status code is a breaking change for the client (`getLoginErrorKey` / `getRegisterErrorKey`).
- New columns on `user` that must stay private: add `select: false` and keep them out of `toPublicUser()`.
- New entity → add it to `src/database/entities.ts`.
- `authConfig.KEY` is provided globally by `ConfigModule.forRoot({ load })`; do not re-import `ConfigModule.forFeature` in modules.
- Lint: `implicit-arrow-linebreak` conflicts with Prettier for long arrow bodies — use a `function` or a block body with an intermediate variable instead.

---

## 10. Known limitations

- No migrations yet (dev relies on `synchronize`).
- No refresh-token reuse detection (a reused revoked token is just rejected, the session family is not killed).
- Failed-attempt counting is read-modify-write, so concurrent bad attempts can be under-counted.
- `409` on register and `423` on login reveal that an account exists (accepted trade-off for UX).
- Email is not verified.
- Password max length is 12 by product decision; OWASP/NIST recommend allowing at least 64.
