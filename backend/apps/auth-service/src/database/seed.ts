import 'reflect-metadata';
import { hash } from 'bcryptjs';
import { Role } from '../../../../libs/common/src';
import { User } from '../users/user.entity';
import dataSource from './data-source';

const seedPassword = 'Password123!';

const seedUsers: Partial<User>[] = [
  {
    employeeCode: 'HRD-001',
    name: 'Rina Hartono',
    email: 'hrd@attendance.test',
    role: Role.HRD,
    position: 'HR Manager',
    department: 'Human Resources',
    phone: '081200000001',
    joinDate: '2021-03-01',
  },
  {
    employeeCode: 'EMP-001',
    name: 'Budi Santoso',
    email: 'budi@attendance.test',
    role: Role.EMPLOYEE,
    position: 'Backend Engineer',
    department: 'Engineering',
    phone: '081200000002',
    joinDate: '2022-07-11',
  },
  {
    employeeCode: 'EMP-002',
    name: 'Sari Wulandari',
    email: 'sari@attendance.test',
    role: Role.EMPLOYEE,
    position: 'Frontend Engineer',
    department: 'Engineering',
    phone: '081200000003',
    joinDate: '2023-01-16',
  },
  {
    employeeCode: 'EMP-003',
    name: 'Agus Pratama',
    email: 'agus@attendance.test',
    role: Role.EMPLOYEE,
    position: 'Finance Staff',
    department: 'Finance',
    phone: '081200000004',
    joinDate: '2023-09-04',
  },
];

async function seed() {
  await dataSource.initialize();

  const users = dataSource.getRepository(User);
  const passwordHash = await hash(seedPassword, 10);
  let created = 0;

  for (const user of seedUsers) {
    if (await users.existsBy({ email: user.email })) {
      continue;
    }

    await users.insert({ ...user, passwordHash });
    created += 1;
  }

  console.log(`Seed selesai: ${created} akun dibuat, ${seedUsers.length - created} sudah ada.`);
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
