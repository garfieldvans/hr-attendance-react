import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ChangeRequestStatus } from '../../../../../libs/common/src';

export class QueryChangeRequestsDto {
  @IsOptional()
  @IsEnum(ChangeRequestStatus, { message: 'Status permintaan tidak valid' })
  status?: ChangeRequestStatus;

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
