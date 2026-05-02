import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService }    from './services/users.service';
import { AuditModule }     from '../audit/audit.module';

@Module({
  imports:     [AuditModule],
  controllers: [UsersController],
  providers:   [UsersService],
  exports:     [UsersService],
})
export class UsersModule {}