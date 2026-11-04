import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttendances1793000001000 implements MigrationInterface {
  name = 'CreateAttendances1793000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`attendances\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT,
        \`user_id\` bigint NOT NULL,
        \`attendance_date\` date NOT NULL,
        \`check_in_at\` datetime NOT NULL,
        \`photo_path\` varchar(255) NOT NULL,
        \`work_type\` enum('WFH', 'WFO') NOT NULL DEFAULT 'WFH',
        \`notes\` varchar(255) NULL,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`uq_attendances_user_date\` (\`user_id\`, \`attendance_date\`),
        INDEX \`idx_attendances_date\` (\`attendance_date\`),
        CONSTRAINT \`fk_attendances_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE = InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `attendances`');
  }
}
