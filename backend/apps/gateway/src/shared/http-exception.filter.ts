import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
}

const STATUS_MESSAGES: Partial<Record<HttpStatus, string>> = {
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'Ukuran foto melebihi batas maksimal',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const { statusCode, message } = describe(exception);
    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(message, exception instanceof Error ? exception.stack : undefined);
    }

    const body: ErrorResponse = { statusCode, message, path: request.url, timestamp: new Date().toISOString() };
    response.status(statusCode).json(body);
  }
}

function describe(exception: unknown): Pick<ErrorResponse, 'statusCode' | 'message'> {
  if (!(exception instanceof HttpException)) {
    return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Terjadi kesalahan pada server' };
  }

  const statusCode = exception.getStatus();
  const response = exception.getResponse();
  const message =
    typeof response === 'object' && response !== null && 'message' in response
      ? (response as { message: string | string[] }).message
      : exception.message;

  return { statusCode, message: STATUS_MESSAGES[statusCode as HttpStatus] ?? message };
}
