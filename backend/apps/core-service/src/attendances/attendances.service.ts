import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryFailedError, Repository } from 'typeorm';
import { JwtPayload } from '../../../../libs/common/src';
import { toAppDate } from './app-date';
import { Attendance } from './attendance.entity';
import { toAttendanceView, toMonitoredView } from './attendance.mapper';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { QueryAttendancesDto, QueryPeriodDto } from './dto/query-attendances.dto';
import { Employee } from './employee.entity';
import { relativePhotoPath, removePhoto } from './photo-storage';

const duplicateEntryError = 1062;

@Injectable()
export class AttendancesService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendances: Repository<Attendance>,
    @InjectRepository(Employee)
    private readonly employees: Repository<Employee>,
  ) {}

  async create(user: JwtPayload, photo: Express.Multer.File | undefined, dto: CreateAttendanceDto) {
    if (!photo) {
      throw new BadRequestException('Foto absensi wajib diunggah');
    }

    const photoPath = relativePhotoPath(photo.path);
    const checkInAt = new Date();
    const attendanceDate = toAppDate(checkInAt);

    const existing = await this.attendances.findOne({
      where: { userId: user.sub, attendanceDate },
    });

    if (existing) {
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
          workType: dto.workType,
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

  async findMine(userId: string, period: QueryPeriodDto) {
    const query = this.attendances
      .createQueryBuilder('attendance')
      .where('attendance.userId = :userId', { userId })
      .orderBy('attendance.attendanceDate', 'DESC');

    if (period.from) {
      query.andWhere('attendance.attendanceDate >= :from', { from: period.from });
    }

    if (period.to) {
      query.andWhere('attendance.attendanceDate <= :to', { to: period.to });
    }

    const attendances = await query.getMany();
    return attendances.map(toAttendanceView);
  }

  async findForMonitoring(filters: QueryAttendancesDto) {
    const query = this.attendances
      .createQueryBuilder('attendance')
      .orderBy('attendance.attendanceDate', 'DESC')
      .addOrderBy('attendance.checkInAt', 'DESC');

    if (filters.from || filters.to) {
      if (filters.from) {
        query.andWhere('attendance.attendanceDate >= :from', { from: filters.from });
      }

      if (filters.to) {
        query.andWhere('attendance.attendanceDate <= :to', { to: filters.to });
      }
    } else {
      query.andWhere('attendance.attendanceDate = :today', { today: toAppDate(new Date()) });
    }

    if (filters.workType) {
      query.andWhere('attendance.workType = :workType', { workType: filters.workType });
    }

    if (filters.userId) {
      query.andWhere('attendance.userId = :userId', { userId: filters.userId });
    }

    if (filters.q) {
      query
        .innerJoin('users', 'employee', 'employee.id = attendance.user_id')
        .andWhere('(employee.name LIKE :keyword OR employee.employee_code LIKE :keyword)', {
          keyword: `%${filters.q.trim()}%`,
        });
    }

    const attendances = await query.getMany();
    const employees = await this.findEmployees(attendances.map((attendance) => attendance.userId));

    return attendances.map((attendance) =>
      toMonitoredView(attendance, employees.get(attendance.userId)),
    );
  }

  private async findEmployees(userIds: string[]) {
    const uniqueIds = [...new Set(userIds)];

    if (!uniqueIds.length) {
      return new Map<string, Employee>();
    }

    const employees = await this.employees.find({ where: { id: In(uniqueIds) } });
    return new Map(employees.map((employee) => [employee.id, employee]));
  }
}
