import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { WorkType } from '../../../../../libs/common/src';

export class CreateAttendanceDto {
  @IsOptional()
  @IsEnum(WorkType, { message: 'Tipe kerja harus WFH' })
  workType?: WorkType;

  @IsOptional()
  @IsString({ message: 'Catatan harus berupa teks' })
  @MaxLength(255, { message: 'Catatan maksimal 255 karakter' })
  notes?: string;
}
