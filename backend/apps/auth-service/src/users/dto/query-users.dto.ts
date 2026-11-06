import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, Max, MaxLength, Min } from 'class-validator';
import { Role } from '../../../../../libs/common/src';

const toBoolean = ({ value }: { value: unknown }) => {
  if (value === 'true' || value === true) {
    return true;
  }

  if (value === 'false' || value === false) {
    return false;
  }

  return value;
};

export class QueryUsersDto {
  @IsOptional()
  @MaxLength(100, { message: 'Kata kunci maksimal 100 karakter' })
  q?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role tidak dikenal' })
  role?: Role;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean({ message: 'Status aktif harus berupa boolean' })
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Halaman harus berupa angka bulat' })
  @Min(1, { message: 'Halaman minimal 1' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Jumlah data harus berupa angka bulat' })
  @Min(1, { message: 'Jumlah data minimal 1' })
  @Max(50, { message: 'Jumlah data maksimal 50' })
  limit?: number;
}
