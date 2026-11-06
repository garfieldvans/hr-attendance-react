import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { WorkType } from '../../../../libs/common/src';

@Entity('attendances')
@Unique('uq_attendances_user_date', ['userId', 'attendanceDate'])
export class Attendance {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Index('idx_attendances_user')
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Index('idx_attendances_date')
  @Column({ name: 'attendance_date', type: 'date' })
  attendanceDate: string;

  @Column({ name: 'check_in_at', type: 'datetime' })
  checkInAt: Date;

  @Column({ name: 'check_out_at', type: 'datetime', nullable: true })
  checkOutAt: Date | null;

  @Column({ name: 'photo_path', length: 255 })
  photoPath: string;

  @Column({ name: 'work_type', type: 'enum', enum: WorkType, default: WorkType.WFH })
  workType: WorkType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
