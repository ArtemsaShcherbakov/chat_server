# Project conventions

## Commands

| Command               | Description              |
| --------------------- | ------------------------ |
| `pnpm run lint`       | Lint sources             |
| `pnpm run format`     | Prettier write           |
| `pnpm run build`      | Nest build               |
| `pnpm run start:dev`  | Dev server (watch)       |
| `pnpm run test`       | Unit tests (Jest)        |
| `pnpm run test:watch` | Unit tests in watch mode |
| `pnpm run test:cov`   | Unit tests with coverage |
| `pnpm run test:e2e`   | E2E tests                |

## Stack

### Runtime dependencies

- **TypeScript** `^5.7.3` — strict mode
- **NestJS** `v11` — `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`
- **NestJS Config** `^4.0.2` — `@nestjs/config`
- **NestJS TypeORM** `^11.0.0` — `@nestjs/typeorm`
- **TypeORM** `^0.3.27` — ORM
- **pg** `^8.23.1` — Postgres driver
- **reflect-metadata** `^0.2.2` — decorators / DI metadata
- **rxjs** `^7.8.1` — reactive streams (Nest internals)

### Database

- **Postgres 16**

### Dev / test tooling

- **Jest** `^30.0.0` + **ts-jest** `^29.2.5` — unit tests
- **@nestjs/testing** `^11.0.1` — Nest testing utilities
- **supertest** `^7.0.0` — e2e HTTP tests
- **ESLint** `^9.18.0` — with `typescript-eslint`, `eslint-config-prettier`, `eslint-plugin-prettier`
- **Prettier** `^3.4.2`
- **@nestjs/cli** `^11` + **@nestjs/schematics** `^11` — build / scaffolding
- **ts-node** `^10.9.2`, **ts-loader** `^9.5.2`, **tsconfig-paths** `^4.2.0`, **source-map-support** `^0.5.21`

## Rules

- Named exports, never default exports.
- All API routes return `{ data, error }` shape.

### Tests are mandatory

- **Every new module / service / controller must ship with tests.**
- **Unit tests** (`*.spec.ts`) live next to source files — Jest picks them up from `src/` via `testRegex: ".*\\.spec\\.ts$"`.
- **E2E tests** for HTTP endpoints live under `test/` and use `supertest` (config: `./test/jest-e2e.json`).
- PRs without tests are not accepted.
- Cover the happy path **and** at least one failure / edge case per unit.
