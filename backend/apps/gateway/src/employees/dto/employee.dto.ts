import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { EmployeeStatus, MAX_PAGE_SIZE } from '@app/common';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateEmployeeDto {
  @ApiProperty({ example: '10244', description: 'NIK karyawan' })
  @Transform(trim)
  @MaxLength(20, { message: 'NIK maksimal 20 karakter' })
  @Matches(/^[A-Za-z0-9-]+$/, { message: 'NIK hanya boleh berisi huruf, angka, atau tanda hubung' })
  @IsNotEmpty({ message: 'NIK wajib diisi' })
  employeeCode: string;

  @ApiProperty({ example: 'Budi Santoso' })
  @Transform(trim)
  @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi' })
  fullName: string;

  @ApiProperty({ example: 'budi.santoso@perusahaan.co.id' })
  @Transform(trim)
  @MaxLength(100, { message: 'Email maksimal 100 karakter' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @ApiPropertyOptional({ example: '081234567890' })
  @Transform(trim)
  @IsOptional()
  @Matches(/^[0-9+\-\s]{8,20}$/, { message: 'Nomor HP tidak valid' })
  phone?: string;

  @ApiProperty({ example: 'Backend Developer' })
  @Transform(trim)
  @MaxLength(50, { message: 'Jabatan maksimal 50 karakter' })
  @IsNotEmpty({ message: 'Jabatan wajib diisi' })
  position: string;

  @ApiProperty({ example: 'IT' })
  @Transform(trim)
  @MaxLength(50, { message: 'Departemen maksimal 50 karakter' })
  @IsNotEmpty({ message: 'Departemen wajib diisi' })
  department: string;

  @ApiProperty({ example: '2023-03-14' })
  @IsDateString({ strict: true }, { message: 'Tanggal bergabung tidak valid' })
  joinDate: string;

  @ApiProperty({ example: 'Karyawan123!', description: 'Password awal untuk login karyawan' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @IsString({ message: 'Password wajib diisi' })
  password: string;
}

export class UpdateEmployeeDto extends PartialType(OmitType(CreateEmployeeDto, ['password'] as const)) {
  @ApiPropertyOptional({ description: 'Isi hanya untuk mereset password' })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  password?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus })
  @IsOptional()
  @IsEnum(EmployeeStatus, { message: 'Status tidak valid' })
  status?: EmployeeStatus;
}

export class FindEmployeesQueryDto {
  @ApiPropertyOptional({ description: 'Cari nama, NIK, atau email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

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
