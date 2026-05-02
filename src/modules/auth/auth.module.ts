import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret:      process.env.JWT_SECRET ?? 'fallback_secret',
        signOptions: { expiresIn: 28800 },
      }),
    }),
  ],
  controllers: [AuthController],
  providers:   [AuthService, JwtStrategy],
  exports:     [AuthService, JwtModule],
})
export class AuthModule {}