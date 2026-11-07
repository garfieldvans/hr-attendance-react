import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { ChangeRequestStatus, JwtPayload, WorkType } from '../../../../libs/common/src';
import { toAppDate, toAppDateTime, toAppTime } from './app-date';
import { AttendanceChangeRequest } from './attendance-change-request.entity';
import { Attendance } from './attendance.entity';
import {
  AttendanceRecord,
  toAttendanceView,
  toMonitoredView,
} from './attendance.mapper';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { QueryAttendancesDto, QueryPeriodDto } from './dto/query-attendances.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { relativePhotoPath, removePhoto } from './photo-storage';

const duplicateEntryError = 1062;
const defaultPageSize = 10;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

interface MonitoringRow extends AttendanceRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeePosition: string | null;
  employeeDepartment: string | null;
}

const attendanceFields = [
  'id',
  "DATE_FORMAT(attendance_date, '%Y-%m-%d') AS attendanceDate",
  'check_in_at AS checkInAt',
  'check_out_at AS checkOutAt',
  'work_type AS workType',
  'notes',
  'photo_path AS photoPath',
].join(', ');

@Injectable()
export class AttendancesService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendances: Repository<Attendance>,
    @InjectRepository(AttendanceChangeRequest)
    private readonly changeRequests: Repository<AttendanceChangeRequest>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(user: JwtPayload, photo: Express.Multer.File | undefined, dto: CreateAttendanceDto) {
    if (!photo) {
      throw new BadRequestException('Foto absensi wajib diunggah');
    }

    const photoPath = relativePhotoPath(photo.path);
    const checkInAt = new Date();
    const attendanceDate = toAppDate(checkInAt);

    const existing = await this.dataSource.query<{ id: string }[]>(
      'SELECT id FROM attendances WHERE user_id = ? AND attendance_date = ? LIMIT 1',
      [user.sub, attendanceDate],
    );

    if (existing.length) {
      await removePhoto(photoPath);
      throw new ConflictException('Kamu sudah absen hari ini');
    }

    try {
      const attendance = await this.attendances.save(
        this.attendances.create({
          userId: user.sub,
          attendanceDate,
          checkInAt,
          photoPath,
          workType: dto.workType ?? WorkType.WFH,
          notes: dto.notes?.trim() || null,
        }),
      );

      return toAttendanceView(attendance);
    } catch (error) {
      await removePhoto(photoPath);

      const isDuplicate =
        error instanceof QueryFailedError &&
        (error.driverError as { errno?: number }).errno === duplicateEntryError;

      if (isDuplicate) {
        throw new ConflictException('Kamu sudah absen hari ini');
      }

      throw error;
    }
  }

  async checkOut(userId: string) {
    const todayRows = await this.dataSource.query<{ id: string; checkOutAt: Date | null }[]>(
      `SELECT id, check_out_at AS checkOutAt FROM attendances
       WHERE user_id = ? AND attendance_date = ? LIMIT 1`,
      [userId, toAppDate(new Date())],
    );
    const today = todayRows[0];

    if (!today) {
      throw new BadRequestException('Kamu belum absen hari ini');
    }

    if (today.checkOutAt) {
      throw new ConflictException('Kamu sudah absen pulang hari ini');
    }

    await this.attendances.update(today.id, { checkOutAt: new Date() });

    const rows = await this.dataSource.query<AttendanceRecord[]>(
      `SELECT ${attendanceFields} FROM attendances WHERE id = ? LIMIT 1`,
      [today.id],
    );

    return toAttendanceView(rows[0]);
  }

  async update(
    user: JwtPayload,
    id: string,
    photo: Express.Multer.File | undefined,
    dto: UpdateAttendanceDto,
  ) {
    if (!/^\d+$/.test(id)) {
      throw new NotFoundException('Absensi tidak ditemukan');
    }

    const rows = await this.dataSource.query<AttendanceRecord[]>(
      `SELECT ${attendanceFields} FROM attendances WHERE id = ? AND user_id = ? LIMIT 1`,
      [id, user.sub],
    );
    const attendance = rows[0];

    if (!attendance) {
      throw new NotFoundException('Absensi tidak ditemukan');
    }

    const now = new Date();
    const photoPath = photo ? relativePhotoPath(photo.path) : null;
    let approvedRequestId: string | null = null;

    try {
      if (attendance.attendanceDate !== toAppDate(now)) {
        const approved = await this.dataSource.query<{ id: string }[]>(
          `SELECT id FROM attendance_change_requests
           WHERE attendance_id = ? AND status = ? AND applied_at IS NULL
           ORDER BY id DESC LIMIT 1`,
          [attendance.id, ChangeRequestStatus.APPROVED],
        );

        if (!approved.length) {
          throw new ForbiddenException(
            'Koreksi absensi hari sebelumnya perlu persetujuan HRD',
          );
        }

        approvedRequestId = approved[0].id;
      }

      const checkInTime = dto.checkInTime?.trim() || toAppTime(attendance.checkInAt);
      const checkOutTime =
        dto.checkOutTime !== undefined
          ? dto.checkOutTime.trim()
          : attendance.checkOutAt
            ? toAppTime(attendance.checkOutAt)
            : '';

      if (!timePattern.test(checkInTime)) {
        throw new BadRequestException('Format jam masuk harus HH:mm');
      }

      if (checkOutTime && !timePattern.test(checkOutTime)) {
        throw new BadRequestException('Format jam pulang harus HH:mm');
      }

      const checkInAt = toAppDateTime(attendance.attendanceDate, checkInTime);
      const checkOutAt = checkOutTime
        ? toAppDateTime(attendance.attendanceDate, checkOutTime)
        : null;

      if (checkInAt > now) {
        throw new BadRequestException('Jam masuk tidak boleh melebihi waktu sekarang');
      }

      if (checkOutAt && checkOutAt > now) {
        throw new BadRequestException('Jam pulang tidak boleh melebihi waktu sekarang');
      }

      if (checkOutAt && checkOutAt <= checkInAt) {
        throw new BadRequestException('Jam pulang harus setelah jam masuk');
      }

      await this.attendances.update(attendance.id, {
        checkInAt,
        checkOutAt,
        notes: dto.notes === undefined ? attendance.notes : dto.notes.trim() || null,
        ...(photoPath ? { photoPath } : {}),
      });
    } catch (error) {
      if (photoPath) {
        await removePhoto(photoPath);
      }

      throw error;
    }

    if (photoPath) {
      await removePhoto(attendance.photoPath);
    }

    if (approvedRequestId) {
      await this.changeRequests.update(approvedRequestId, { appliedAt: now });
    }

    const updatedRows = await this.dataSource.query<AttendanceRecord[]>(
      `SELECT ${attendanceFields} FROM attendances WHERE id = ? LIMIT 1`,
      [attendance.id],
    );

    return toAttendanceView(updatedRows[0]);
  }

  async findMine(userId: string, period: QueryPeriodDto) {
    const conditions = ['user_id = ?'];
    const params: string[] = [userId];

    if (period.from) {
      conditions.push('attendance_date >= ?');
      params.push(period.from);
    }

    if (period.to) {
      conditions.push('attendance_date <= ?');
      params.push(period.to);
    }

    const rows = await this.dataSource.query<AttendanceRecord[]>(
      `SELECT ${attendanceFields} FROM attendances
       WHERE ${conditions.join(' AND ')}
       ORDER BY attendance_date DESC`,
      params,
    );

    return rows.map(toAttendanceView);
  }

  async findForMonitoring(filters: QueryAttendancesDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? defaultPageSize;
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filters.from || filters.to) {
      if (filters.from) {
        conditions.push('a.attendance_date >= ?');
        params.push(filters.from);
      }

      if (filters.to) {
        conditions.push('a.attendance_date <= ?');
        params.push(filters.to);
      }
    } else {
      conditions.push('a.attendance_date = ?');
      params.push(toAppDate(new Date()));
    }

    if (filters.userId) {
      conditions.push('a.user_id = ?');
      params.push(filters.userId);
    }

    if (filters.q) {
      const keyword = `%${filters.q.trim()}%`;
      conditions.push('(u.name LIKE ? OR u.employee_code LIKE ?)');
      params.push(keyword, keyword);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const rows = await this.dataSource.query<MonitoringRow[]>(
      `SELECT a.id, DATE_FORMAT(a.attendance_date, '%Y-%m-%d') AS attendanceDate,
              a.check_in_at AS checkInAt, a.check_out_at AS checkOutAt,
              a.work_type AS workType, a.notes, a.photo_path AS photoPath,
              u.id AS employeeId, u.employee_code AS employeeCode, u.name AS employeeName,
              u.position AS employeePosition, u.department AS employeeDepartment
       FROM attendances a
       INNER JOIN users u ON u.id = a.user_id
       ${where}
       ORDER BY a.attendance_date DESC, a.check_in_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, (page - 1) * limit],
    );

    const totals = await this.dataSource.query<{ total: number | string }[]>(
      `SELECT COUNT(*) AS total FROM attendances a INNER JOIN users u ON u.id = a.user_id ${where}`,
      params,
    );
    const total = Number(totals[0]?.total ?? 0);

    return {
      items: rows.map((row) =>
        toMonitoredView(row, {
          id: row.employeeId,
          employeeCode: row.employeeCode,
          name: row.employeeName,
          position: row.employeePosition,
          department: row.employeeDepartment,
        }),
      ),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
