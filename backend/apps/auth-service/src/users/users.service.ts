import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

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
    return this.repository.findOne({ where: { id } });
  }
}
