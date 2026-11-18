import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

interface DatabaseOptions {
  databaseEnvKey: string;
  entities: Function[];
  migrations: Function[];
}

export function buildDatabaseOptions(
  config: ConfigService,
  { databaseEnvKey, entities, migrations }: DatabaseOptions,
): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: config.get<string>('DB_HOST', 'localhost'),
    port: Number(config.get('DB_PORT', 3306)),
    username: config.getOrThrow<string>('DB_USER'),
    password: config.getOrThrow<string>('DB_PASSWORD'),
    database: config.getOrThrow<string>(databaseEnvKey),
    entities,
    migrations,
    migrationsRun: true,
    synchronize: false,
    timezone: 'Z',
    dateStrings: ['DATE'],
    logging: config.get('DB_LOGGING') === 'true',
  };
}
