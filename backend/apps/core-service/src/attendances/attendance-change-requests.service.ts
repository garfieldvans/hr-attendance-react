import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ChangeRequestStatus, JwtPayload } from '../../../../libs/common/src';
import { toAppDate } from './app-date';
import { AttendanceChangeRequest } from './attendance-change-request.entity';
import {
  ChangeRequestRow,
  toChangeRequestView,
} from './attendance-change-request.mapper';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { QueryChangeRequestsDto } from './dto/query-change-requests.dto';
import { ReviewChangeRequestDto } from './dto/review-change-request.dto';

const defaultPageSize = 10;

const changeRequestFields = `
  r.id, r.attendance_id AS attendanceId, r.reason, r.status,
  r.review_note AS reviewNote, r.reviewed_at AS reviewedAt, r.applied_at AS appliedAt,
  r.created_at AS createdAt,
  DATE_FORMAT(a.attendance_date, '%Y-%m-%d') AS attendanceDate,
  a.check_in_at AS checkInAt, a.check_out_at AS checkOutAt, a.notes AS attendanceNotes,
  u.id AS employeeId, u.employee_code AS employeeCode, u.name AS employeeName,
  u.position AS employeePosition, u.department AS employeeDepartment
`;

const changeRequestQuery = `
  SELECT ${changeRequestFields}
  FROM attendance_change_requests r
  INNER JOIN attendances a ON a.id = r.attendance_id
  INNER JOIN users u ON u.id = r.user_id
`;

@Injectable()
export class AttendanceChangeRequestsService {
  constructor(
    @InjectRepository(AttendanceChangeRequest)
    private readonly requests: Repository<AttendanceChangeRequest>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(user: JwtPayload, dto: CreateChangeRequestDto) {
    const attendanceRows = await this.dataSource.query<
      { id: string; attendanceDate: string }[]
    >(
      `SELECT id, DATE_FORMAT(attendance_date, '%Y-%m-%d') AS attendanceDate
       FROM attendances WHERE id = ? AND user_id = ? LIMIT 1`,
      [dto.attendanceId, user.sub],
    );
    const attendance = attendanceRows[0];

    if (!attendance) {
      throw new NotFoundException('Absensi tidak ditemukan');
    }

    if (attendance.attendanceDate >= toAppDate(new Date())) {
      throw new BadRequestException(
        'Absensi hari ini bisa langsung diubah tanpa permintaan koreksi',
      );
    }

    const pending = await this.dataSource.query<{ id: string }[]>(
      'SELECT id FROM attendance_change_requests WHERE attendance_id = ? AND status = ? LIMIT 1',
      [attendance.id, ChangeRequestStatus.PENDING],
    );

    if (pending.length) {
      throw new ConflictException('Permintaan koreksi masih menunggu persetujuan HRD');
    }

    const approved = await this.dataSource.query<{ id: string }[]>(
      `SELECT id FROM attendance_change_requests
       WHERE attendance_id = ? AND status = ? AND applied_at IS NULL LIMIT 1`,
      [attendance.id, ChangeRequestStatus.APPROVED],
    );

    if (approved.length) {
      throw new ConflictException(
        'Permintaan koreksi sebelumnya sudah disetujui, silakan perbarui absensinya',
      );
    }

    const request = await this.requests.save(
      this.requests.create({
        attendanceId: attendance.id,
        userId: user.sub,
        reason: dto.reason.trim(),
      }),
    );

    return this.findById(request.id);
  }

  async findMine(userId: string) {
    const rows = await this.dataSource.query<ChangeRequestRow[]>(
      `${changeRequestQuery} WHERE r.user_id = ? ORDER BY r.created_at DESC, r.id DESC`,
      [userId],
    );

    return rows.map(toChangeRequestView);
  }

  async findForHrd(filters: QueryChangeRequestsDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? defaultPageSize;
    const status = filters.status ?? ChangeRequestStatus.PENDING;
    const params = [status];

    const rows = await this.dataSource.query<ChangeRequestRow[]>(
      `${changeRequestQuery} WHERE r.status = ?
       ORDER BY r.created_at ASC, r.id ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, (page - 1) * limit],
    );

    const totals = await this.dataSource.query<{ total: number | string }[]>(
      'SELECT COUNT(*) AS total FROM attendance_change_requests WHERE status = ?',
      params,
    );
    const total = Number(totals[0]?.total ?? 0);

    return {
      items: rows.map(toChangeRequestView),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async review(reviewer: JwtPayload, id: string, dto: ReviewChangeRequestDto) {
    const request = await this.findEntity(id);

    if (request.status !== ChangeRequestStatus.PENDING) {
      throw new ConflictException('Permintaan koreksi sudah diproses');
    }

    await this.requests.update(request.id, {
      status: dto.status,
      reviewNote: dto.reviewNote?.trim() || null,
      reviewedBy: reviewer.sub,
      reviewedAt: new Date(),
    });

    return this.findById(request.id);
  }

  private async findEntity(id: string) {
    if (!/^\d+$/.test(id)) {
      throw new NotFoundException('Permintaan koreksi tidak ditemukan');
    }

    const request = await this.requests.findOne({ where: { id } });

    if (!request) {
      throw new NotFoundException('Permintaan koreksi tidak ditemukan');
    }

    return request;
  }

  private async findById(id: string) {
    const rows = await this.dataSource.query<ChangeRequestRow[]>(
      `${changeRequestQuery} WHERE r.id = ? LIMIT 1`,
      [id],
    );
    const request = rows[0];

    if (!request) {
      throw new NotFoundException('Permintaan koreksi tidak ditemukan');
    }

    return toChangeRequestView(request);
  }
}
