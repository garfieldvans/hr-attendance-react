import { Type } from 'class-transformer';
import { IsInt, IsOptional, Matches, Max, MaxLength, Min } from 'class-validator';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const dateMessage = 'Format tanggal harus YYYY-MM-DD';

export class QueryPeriodDto {
  @IsOptional()
  @Matches(datePattern, { message: dateMessage })
  from?: string;

  @IsOptional()
  @Matches(datePattern, { message: dateMessage })
  to?: string;
}

export class QueryAttendancesDto extends QueryPeriodDto {
  @IsOptional()
  @MaxLength(100, { message: 'Kata kunci maksimal 100 karakter' })
  q?: string;

  @IsOptional()
  @Matches(/^\d+$/, { message: 'ID karyawan tidak valid' })
  userId?: string;

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
