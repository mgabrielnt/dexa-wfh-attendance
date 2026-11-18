import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ATTENDANCE_SERVICE, AUTH_SERVICE, EMPLOYEE_SERVICE, isRpcErrorBody } from '@app/common';

const REQUEST_TIMEOUT_MS = 10_000;

@Injectable()
export class ServiceClient {
  private readonly logger = new Logger(ServiceClient.name);

  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(EMPLOYEE_SERVICE) private readonly employeeClient: ClientProxy,
    @Inject(ATTENDANCE_SERVICE) private readonly attendanceClient: ClientProxy,
  ) {}

  auth<T>(pattern: string, payload: unknown = {}): Promise<T> {
    return this.send(this.authClient, pattern, payload);
  }

  employee<T>(pattern: string, payload: unknown = {}): Promise<T> {
    return this.send(this.employeeClient, pattern, payload);
  }

  attendance<T>(pattern: string, payload: unknown = {}): Promise<T> {
    return this.send(this.attendanceClient, pattern, payload);
  }

  private async send<T>(client: ClientProxy, pattern: string, payload: unknown): Promise<T> {
    try {
      return await firstValueFrom(client.send<T>(pattern, payload).pipe(timeout(REQUEST_TIMEOUT_MS)));
    } catch (error) {
      if (isRpcErrorBody(error)) {
        throw new HttpException(error.message, error.statusCode);
      }
      this.logger.error(`"${pattern}" failed`, error instanceof Error ? error.stack : String(error));
      throw new HttpException('Layanan sedang tidak tersedia, coba lagi nanti', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
