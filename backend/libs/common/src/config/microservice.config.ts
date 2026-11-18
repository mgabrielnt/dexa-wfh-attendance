import { ConfigService } from '@nestjs/config';
import { ClientsProviderAsyncOptions, MicroserviceOptions, Transport } from '@nestjs/microservices';

export function tcpServerOptions(portEnvKey: string): MicroserviceOptions {
  return {
    transport: Transport.TCP,
    options: {
      host: process.env.SERVICE_BIND_HOST ?? '0.0.0.0',
      port: Number(process.env[portEnvKey]),
    },
  };
}

export function tcpClient(name: string, hostEnvKey: string, portEnvKey: string): ClientsProviderAsyncOptions {
  return {
    name,
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      transport: Transport.TCP,
      options: {
        host: config.get<string>(hostEnvKey, '127.0.0.1'),
        port: Number(config.getOrThrow(portEnvKey)),
      },
    }),
  };
}
