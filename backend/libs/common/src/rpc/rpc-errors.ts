import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

interface RpcErrorBody {
  statusCode: number;
  message: string;
}

const rpcError = (statusCode: HttpStatus, message: string) =>
  new RpcException({ statusCode, message } satisfies RpcErrorBody);

export const RpcErrors = {
  unauthorized: (message: string) => rpcError(HttpStatus.UNAUTHORIZED, message),
  forbidden: (message: string) => rpcError(HttpStatus.FORBIDDEN, message),
  notFound: (message: string) => rpcError(HttpStatus.NOT_FOUND, message),
  conflict: (message: string) => rpcError(HttpStatus.CONFLICT, message),
};

export function isRpcErrorBody(value: unknown): value is RpcErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as RpcErrorBody).statusCode === 'number' &&
    typeof (value as RpcErrorBody).message === 'string'
  );
}
