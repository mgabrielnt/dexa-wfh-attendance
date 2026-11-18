import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { MAX_PAGE_SIZE } from '@app/common';

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export class CheckInDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Foto bukti WFH (JPG/PNG)' })
  photo: unknown;

  @ApiPropertyOptional({ example: 'Lanjut task API absensi' })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Catatan maksimal 255 karakter' })
  notes?: string;
}

class PageQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number;
}

export class MyAttendancesQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ example: '2026-11', description: 'Bulan (YYYY-MM), default bulan ini' })
  @IsOptional()
  @Matches(MONTH_PATTERN, { message: 'Format bulan harus YYYY-MM' })
  month?: string;
}

export class FindAttendancesQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ example: '2026-11-01' })
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Tanggal awal tidak valid' })
  from?: string;

  @ApiPropertyOptional({ example: '2026-11-16' })
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Tanggal akhir tidak valid' })
  to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  employeeId?: number;
}

export class StatsQueryDto {
  @ApiPropertyOptional({ example: '2026-11' })
  @IsOptional()
  @Matches(MONTH_PATTERN, { message: 'Format bulan harus YYYY-MM' })
  month?: string;

  @ApiPropertyOptional({ description: 'Wajib untuk Admin HRD; diabaikan untuk karyawan' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  employeeId?: number;
}

export class SummaryQueryDto {
  @ApiPropertyOptional({ example: '2026-11-16', description: 'Default hari ini' })
  @IsOptional()
  @IsDateString({ strict: true })
  date?: string;
}
