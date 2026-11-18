import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { tcpServerOptions } from '@app/common';
import { AttendanceModule } from './attendance.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AttendanceModule,
    tcpServerOptions('ATTENDANCE_SERVICE_PORT'),
  );
  await app.listen();
  Logger.log(`Attendance service listening on TCP :${process.env.ATTENDANCE_SERVICE_PORT}`, 'Bootstrap');
}

bootstrap();
