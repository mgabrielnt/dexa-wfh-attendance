import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDatabaseOptions } from '@app/common';
import { AttendanceController } from './attendance.controller';
import { Attendance } from './attendance.entity';
import { AttendanceService } from './attendance.service';
import { CreateAttendancesTable1731700000002 } from './database/migrations/1731700000002-create-attendances-table';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        buildDatabaseOptions(config, {
          databaseEnvKey: 'ATTENDANCE_DB_NAME',
          entities: [Attendance],
          migrations: [CreateAttendancesTable1731700000002],
        }),
    }),
    TypeOrmModule.forFeature([Attendance]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
