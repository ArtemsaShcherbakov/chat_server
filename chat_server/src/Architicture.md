src/
├── main.ts # bootstrap: ValidationPipe
├── app.module.ts # only root module imports
│
├── config/
│ ├── configuration.ts # typed config (registerAs)
│ └── env.validation.ts # Joi validation of process.env
│
├── database/
│ ├── data-source.ts # DataSource for CLI (migrations)
│ └── migrations/ # only here; never edit manually
│
├── shared/ # infrastructure (2+ modules)
│ ├── shared.module.ts
│ ├── filters/
│ │ └── http-exception.filter.ts
│ ├── interceptors/
│ │ └── logging.interceptor.ts
│ └── decorators/
│ └── current-user.decorator.ts
│
├── auth/
│ ├── auth.module.ts
│ ├── auth.controller.ts
│ ├── auth.service.ts
│ ├── strategies/
│ │ └── jwt.strategy.ts
│ ├── guards/
│ │ └── jwt-auth.guard.ts
│ └── dto/
│ ├── login.dto.ts
│ └── register.dto.ts
