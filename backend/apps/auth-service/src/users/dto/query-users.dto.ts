import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, MaxLength } from 'class-validator';
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
}
