import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChangeRequestStatus } from '../../../../libs/common/src';

@Entity('attendance_change_requests')
export class AttendanceChangeRequest {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Index('idx_change_requests_attendance')
  @Column({ name: 'attendance_id', type: 'bigint' })
  attendanceId: string;

  @Index('idx_change_requests_user')
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ length: 255 })
  reason: string;

  @Index('idx_change_requests_status')
  @Column({ type: 'enum', enum: ChangeRequestStatus, default: ChangeRequestStatus.PENDING })
  status: ChangeRequestStatus;

  @Column({ name: 'review_note', type: 'varchar', length: 255, nullable: true })
  reviewNote: string | null;

  @Column({ name: 'reviewed_by', type: 'bigint', nullable: true })
  reviewedBy: string | null;

  @Column({ name: 'reviewed_at', type: 'datetime', nullable: true })
  reviewedAt: Date | null;

  @Column({ name: 'applied_at', type: 'datetime', nullable: true })
  appliedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
