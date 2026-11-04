import { IsEnum, IsOptional, Matches, MaxLength } from 'class-validator';
import { WorkType } from '../../../../../libs/common/src';

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
  @IsEnum(WorkType, { message: 'Tipe kerja harus WFH atau WFO' })
  workType?: WorkType;

  @IsOptional()
  @Matches(/^\d+$/, { message: 'ID karyawan tidak valid' })
  userId?: string;
}
