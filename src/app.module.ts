import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule }    from '@nestjs/config';
import { APP_GUARD }       from '@nestjs/core';
import { PrismaModule }    from './infrastructure/database/prisma.module';
import { MailModule }      from './infrastructure/mail/mail.module';
import { PdfModule }       from './infrastructure/pdf/pdf.module';
import { ExportModule }    from './infrastructure/export/export.module';
import { StorageModule }   from './infrastructure/storage/storage.module';
import { AuditModule }     from './modules/audit/audit.module';
import { AuthModule }      from './modules/auth/auth.module';
import { UsersModule }     from './modules/users/users.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ClientsModule }   from './modules/clients/clients.module';
import { SettingsModule }  from './modules/settings/settings.module';
import { SalesModule }     from './modules/sales/sales.module';
import { AlertsModule }    from './modules/alerts/alerts.module';
import { ReportsModule }   from './modules/reports/reports.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ProfileModule }   from './modules/profile/profile.module';
import { JwtAuthGuard }    from './shared/guards/jwt-auth.guard';
import { RolesGuard }      from './shared/guards/roles.guard';
import { PermissionGuard } from './shared/guards/permission.guard';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';
import { appConfig }       from './config/app.config';
import { jwtConfig }       from './config/jwt.config';
import { mailConfig }      from './config/mail.config';
import { AppController }   from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load:     [appConfig, jwtConfig, mailConfig],
    }),
    PrismaModule,
    MailModule,
    PdfModule,
    ExportModule,
    StorageModule,
    AuditModule,
    AuthModule,
    UsersModule,
    InventoryModule,
    ClientsModule,
    SettingsModule,
    SalesModule,
    AlertsModule,
    ReportsModule,
    DashboardModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*path', method: 0 });
  }
}