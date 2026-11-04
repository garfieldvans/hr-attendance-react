import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

const passwordSaltRounds = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.repository.findOne({ where: { email: email.trim().toLowerCase() } });
  }

  findById(id: string) {
    if (!/^\d+$/.test(id)) {
      return Promise.resolve(null);
    }

    return this.repository.findOne({ where: { id } });
  }

  findAll(filters: QueryUsersDto) {
    const query = this.repository
      .createQueryBuilder('user')
      .orderBy('user.employeeCode', 'ASC');

    if (filters.q) {
      query.andWhere(
        '(user.name LIKE :keyword OR user.employeeCode LIKE :keyword OR user.email LIKE :keyword)',
        { keyword: `%${filters.q.trim()}%` },
      );
    }

    if (filters.role) {
      query.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters.isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
    }

    return query.getMany();
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
    const emailOwner = await this.repository.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    if (emailOwner && emailOwner.id !== exceptId) {
      throw new ConflictException('Email sudah dipakai karyawan lain');
    }

    const codeOwner = await this.repository.findOne({ where: { employeeCode } });

    if (codeOwner && codeOwner.id !== exceptId) {
      throw new ConflictException('Kode karyawan sudah dipakai');
    }
  }
}
