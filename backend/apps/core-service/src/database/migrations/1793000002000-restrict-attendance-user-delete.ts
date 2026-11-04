import { MigrationInterface, QueryRunner } from 'typeorm';

export class RestrictAttendanceUserDelete1793000002000 implements MigrationInterface {
  name = 'RestrictAttendanceUserDelete1793000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `attendances` DROP FOREIGN KEY `fk_attendances_user`');
    await queryRunner.query(`
      ALTER TABLE \`attendances\`
        ADD CONSTRAINT \`fk_attendances_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
        ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `attendances` DROP FOREIGN KEY `fk_attendances_user`');
    await queryRunner.query(`
      ALTER TABLE \`attendances\`
        ADD CONSTRAINT \`fk_attendances_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
        ON DELETE CASCADE
    `);
  }
}
