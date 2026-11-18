import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { tcpServerOptions } from '@app/common';
import { EmployeeModule } from './employee.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EmployeeModule,
    tcpServerOptions('EMPLOYEE_SERVICE_PORT'),
  );
  await app.listen();
  Logger.log(`Employee service listening on TCP :${process.env.EMPLOYEE_SERVICE_PORT}`, 'Bootstrap');
}

bootstrap();
