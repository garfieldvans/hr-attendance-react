import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAttendanceCheckOut1793000004000 implements MigrationInterface {
  name = 'AddAttendanceCheckOut1793000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `attendances` ADD `check_out_at` datetime NULL AFTER `check_in_at`',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `attendances` DROP COLUMN `check_out_at`');
  }
}
