import { Module } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { authConfig } from '../config/configuration';
import { Users } from '../entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Tokens } from './entities/tokens.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

// authConfig.KEY is provided globally by ConfigModule.forRoot({ load }) in AppModule
@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Tokens]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [authConfig.KEY],
      useFactory: (config: ConfigType<typeof authConfig>) => ({
        secret: config.jwtSecret,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
