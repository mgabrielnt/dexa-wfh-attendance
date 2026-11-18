import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';
import { photoStorageOptions } from './photo-storage.config';

@Module({
  imports: [MulterModule.registerAsync({ inject: [ConfigService], useFactory: photoStorageOptions })],
  controllers: [AttendancesController],
  providers: [AttendancesService],
})
export class AttendancesModule {}
