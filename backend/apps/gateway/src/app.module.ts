import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AttendancesModule } from './attendances/attendances.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { EmployeesModule } from './employees/employees.module';
import { ServiceClientsModule } from './shared/service-clients.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServiceClientsModule,
    AuthModule,
    EmployeesModule,
    AttendancesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
