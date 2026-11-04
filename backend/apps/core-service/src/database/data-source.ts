import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Attendance } from '../attendances/attendance.entity';
import { Employee } from '../attendances/employee.entity';

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'attendance',
  password: process.env.DB_PASSWORD ?? 'attendance',
  database: process.env.DB_NAME ?? 'attendance_db',
  entities: [Attendance, Employee],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
});
