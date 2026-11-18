import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { tcpServerOptions } from '@app/common';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    tcpServerOptions('AUTH_SERVICE_PORT'),
  );
  await app.listen();
  Logger.log(`Auth service listening on TCP :${process.env.AUTH_SERVICE_PORT}`, 'Bootstrap');
}

bootstrap();
