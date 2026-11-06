import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { JwtPayload, WorkType } from '../../../../libs/common/src';
import { toAppDate } from './app-date';
import { Attendance } from './attendance.entity';
import {
  AttendanceRecord,
  toAttendanceView,
  toMonitoredView,
} from './attendance.mapper';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { QueryAttendancesDto, QueryPeriodDto } from './dto/query-attendances.dto';
import { relativePhotoPath, removePhoto } from './photo-storage';

const duplicateEntryError = 1062;
const defaultPageSize = 10;

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
