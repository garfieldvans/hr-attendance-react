import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../../../../../libs/common/src';

const trimmed = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const upperCased = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

const lowerCased = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class CreateUserDto {
  @Transform(upperCased)
  @IsNotEmpty({ message: 'Kode karyawan wajib diisi' })
  @MaxLength(20, { message: 'Kode karyawan maksimal 20 karakter' })
  @Matches(/^[A-Z0-9-]+$/, { message: 'Kode karyawan hanya boleh huruf, angka, dan tanda hubung' })
  employeeCode: string;

  @Transform(trimmed)
  @IsNotEmpty({ message: 'Nama wajib diisi' })
  @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
  name: string;

  @Transform(lowerCased)
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(72, { message: 'Password maksimal 72 karakter' })
  password: string;

  @IsEnum(Role, { message: 'Role tidak dikenal' })
  role: Role;

  @IsOptional()
  @Transform(trimmed)
  @MaxLength(100, { message: 'Jabatan maksimal 100 karakter' })
  position?: string;

  @IsOptional()
  @Transform(trimmed)
  @MaxLength(100, { message: 'Divisi maksimal 100 karakter' })
  department?: string;

  @IsOptional()
  @Transform(trimmed)
  @MaxLength(20, { message: 'Nomor telepon maksimal 20 karakter' })
  @Matches(/^[0-9+\-\s]+$/, { message: 'Nomor telepon tidak valid' })
  phone?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Format tanggal harus YYYY-MM-DD' })
  joinDate?: string;

  @IsOptional()
  @IsBoolean({ message: 'Status aktif harus berupa boolean' })
  isActive?: boolean;
}
