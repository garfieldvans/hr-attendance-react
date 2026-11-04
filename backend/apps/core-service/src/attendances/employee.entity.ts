import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
export class Employee {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'employee_code', length: 20 })
  employeeCode: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  position: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string | null;
}
