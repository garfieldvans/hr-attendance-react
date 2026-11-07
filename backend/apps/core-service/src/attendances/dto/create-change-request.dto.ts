import { IsString, Length, Matches } from 'class-validator';

export class CreateChangeRequestDto {
  @Matches(/^\d+$/, { message: 'ID absensi tidak valid' })
  attendanceId: string;

  @IsString({ message: 'Alasan harus berupa teks' })
  @Length(5, 255, { message: 'Alasan harus 5 sampai 255 karakter' })
  reason: string;
}
