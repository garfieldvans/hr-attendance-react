import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsString({ message: 'Jam masuk harus berupa teks' })
  checkInTime?: string;

  @IsOptional()
  @IsString({ message: 'Jam pulang harus berupa teks' })
  checkOutTime?: string;

  @IsOptional()
  @IsString({ message: 'Catatan harus berupa teks' })
  @MaxLength(255, { message: 'Catatan maksimal 255 karakter' })
  notes?: string;
}
