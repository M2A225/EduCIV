import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { InvitationsModule } from '../invitations/invitations.module';
import { RefreshTokenRepository } from './refresh-token.repository';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    InvitationsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenRepository, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
