import { Global, Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { ATTENDANCE_SERVICE, AUTH_SERVICE, EMPLOYEE_SERVICE, tcpClient } from '@app/common';
import { ServiceClient } from './service-client';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      tcpClient(AUTH_SERVICE, 'AUTH_SERVICE_HOST', 'AUTH_SERVICE_PORT'),
      tcpClient(EMPLOYEE_SERVICE, 'EMPLOYEE_SERVICE_HOST', 'EMPLOYEE_SERVICE_PORT'),
      tcpClient(ATTENDANCE_SERVICE, 'ATTENDANCE_SERVICE_HOST', 'ATTENDANCE_SERVICE_PORT'),
    ]),
  ],
  providers: [ServiceClient],
  exports: [ServiceClient],
})
export class ServiceClientsModule {}
