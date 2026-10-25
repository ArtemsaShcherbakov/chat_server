import { ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { readFileSync } from 'fs';
import { AppModule } from './app.module';
import { requireHttps } from './shared/middleware/require-https.middleware';

async function bootstrap() {
  // .env is loaded asynchronously by ConfigModule; wait so the TLS paths are visible
  await ConfigModule.envVariablesLoaded;
  const { HTTPS_KEY_PATH, HTTPS_CERT_PATH } = process.env;
  const httpsOptions =
    HTTPS_KEY_PATH && HTTPS_CERT_PATH
      ? {
          key: readFileSync(HTTPS_KEY_PATH),
          cert: readFileSync(HTTPS_CERT_PATH),
        }
      : undefined;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
  });
  const config = app.get(ConfigService);

  if (config.get<boolean>('app.trustProxy')) {
    app.set('trust proxy', 1);
  }
  if (config.get<string>('app.nodeEnv') === 'production') {
    app.use(requireHttps);
  }

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(config.get<number>('app.port', 3000));
}
void bootstrap();
