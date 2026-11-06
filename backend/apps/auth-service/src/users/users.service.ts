import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { Role } from '../../../../libs/common/src';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

const passwordSaltRounds = 10;

interface UserRow {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  position: string | null;
  department: string | null;
  phone: string | null;
  joinDate: string | null;
  isActive: number | boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userFields = [
  'id',
  'employee_code AS employeeCode',
  'name',
  'email',
  'password_hash AS passwordHash',
  'role',
  'position',
  'department',
  'phone',
  "DATE_FORMAT(join_date, '%Y-%m-%d') AS joinDate",
  'is_active AS isActive',
  'created_at AS createdAt',
  'updated_at AS updatedAt',
].join(', ');

const toUser = (row: UserRow): User => ({
  ...row,
  isActive: Boolean(row.isActive),
});

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findByEmail(email: string) {
    const rows = await this.dataSource.query<UserRow[]>(
      `SELECT ${userFields} FROM users WHERE email = ? LIMIT 1`,
      [email.trim().toLowerCase()],
    );

    return rows.length ? toUser(rows[0]) : null;
  }

  async findById(id: string) {
    if (!/^\d+$/.test(id)) {
      return null;
    }

    const rows = await this.dataSource.query<UserRow[]>(
      `SELECT ${userFields} FROM users WHERE id = ? LIMIT 1`,
      [id],
    );

    return rows.length ? toUser(rows[0]) : null;
  }

  async findAll(filters: QueryUsersDto) {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filters.q) {
      const keyword = `%${filters.q.trim()}%`;
      conditions.push('(name LIKE ? OR employee_code LIKE ? OR email LIKE ?)');
      params.push(keyword, keyword, keyword);
    }

    if (filters.role) {
      conditions.push('role = ?');
      params.push(filters.role);
    }

    if (filters.isActive !== undefined) {
      conditions.push('is_active = ?');
      params.push(filters.isActive ? 1 : 0);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await this.dataSource.query<UserRow[]>(
      `SELECT ${userFields} FROM users ${where} ORDER BY employee_code ASC`,
      params,
    );

    return rows.map(toUser);
  }

  async findDetail(id: string) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    await this.assertUnique(dto.email, dto.employeeCode);

    return this.repository.save(
      this.repository.create({
        employeeCode: dto.employeeCode,
        name: dto.name,
        email: dto.email,
        passwordHash: await hash(dto.password, passwordSaltRounds),
        role: dto.role,
        position: dto.position ?? null,
        department: dto.department ?? null,
        phone: dto.phone ?? null,
        joinDate: dto.joinDate ?? null,
        isActive: dto.isActive ?? true,
      }),
    );
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findDetail(id);
    const email = dto.email ?? user.email;
    const employeeCode = dto.employeeCode ?? user.employeeCode;

    await this.assertUnique(email, employeeCode, user.id);

    if (dto.employeeCode !== undefined) user.employeeCode = dto.employeeCode;
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.position !== undefined) user.position = dto.position;
    if (dto.department !== undefined) user.department = dto.department;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.joinDate !== undefined) user.joinDate = dto.joinDate;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.password !== undefined) user.passwordHash = await hash(dto.password, passwordSaltRounds);

    return this.repository.save(user);
  }

  async remove(id: string) {
    const user = await this.findDetail(id);

    try {
      await this.repository.remove(user);
    } catch (error) {
      const isStillReferenced =
        error instanceof QueryFailedError &&
        (error.driverError as { errno?: number }).errno === 1451;

      if (isStillReferenced) {
        throw new ConflictException(
          'Karyawan sudah punya data absensi, ubah statusnya menjadi nonaktif saja',
        );
      }

      throw error;
    }
  }

  private async assertUnique(email: string, employeeCode: string, exceptId?: string) {
    const emailOwners = await this.dataSource.query<{ id: string }[]>(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email.trim().toLowerCase()],
    );

    if (emailOwners.length && emailOwners[0].id !== exceptId) {
      throw new ConflictException('Email sudah dipakai karyawan lain');
    }

    const codeOwners = await this.dataSource.query<{ id: string }[]>(
      'SELECT id FROM users WHERE employee_code = ? LIMIT 1',
      [employeeCode],
    );

    if (codeOwners.length && codeOwners[0].id !== exceptId) {
      throw new ConflictException('Kode karyawan sudah dipakai');
    }
  }
}
