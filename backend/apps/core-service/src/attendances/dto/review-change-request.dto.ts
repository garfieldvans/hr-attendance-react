import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ChangeRequestStatus } from '../../../../../libs/common/src';

export class ReviewChangeRequestDto {
  @IsIn([ChangeRequestStatus.APPROVED, ChangeRequestStatus.REJECTED], {
    message: 'Status review harus APPROVED atau REJECTED',
  })
  status: ChangeRequestStatus.APPROVED | ChangeRequestStatus.REJECTED;

  @IsOptional()
  @IsString({ message: 'Catatan review harus berupa teks' })
  @MaxLength(255, { message: 'Catatan review maksimal 255 karakter' })
  reviewNote?: string;
}
