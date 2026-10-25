import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { entities } from './entities';

// Used only by the TypeORM CLI, e.g.:
//   pnpm typeorm migration:generate -d src/database/data-source.ts src/database/migrations/<Name>
process.loadEnvFile?.('.env');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities,
  migrations: [__dirname + '/migrations/*.{ts,js}'],
});
