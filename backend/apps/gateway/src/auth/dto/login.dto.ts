import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@presensiku.test' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsNotEmpty({ message: 'Password wajib diisi' })
  @IsString({ message: 'Password wajib diisi' })
  password: string;
}
