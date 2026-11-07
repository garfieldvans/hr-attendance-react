import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttendanceChangeRequests1793000005000 implements MigrationInterface {
  name = 'CreateAttendanceChangeRequests1793000005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`attendance_change_requests\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT,
        \`attendance_id\` bigint NOT NULL,
        \`user_id\` bigint NOT NULL,
        \`reason\` varchar(255) NOT NULL,
        \`status\` enum('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
        \`review_note\` varchar(255) NULL,
        \`reviewed_by\` bigint NULL,
        \`reviewed_at\` datetime NULL,
        \`applied_at\` datetime NULL,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_change_requests_attendance\` (\`attendance_id\`),
        INDEX \`idx_change_requests_user\` (\`user_id\`),
        INDEX \`idx_change_requests_status\` (\`status\`),
        CONSTRAINT \`fk_change_requests_attendance\` FOREIGN KEY (\`attendance_id\`) REFERENCES \`attendances\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_change_requests_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_change_requests_reviewer\` FOREIGN KEY (\`reviewed_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE = InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `attendance_change_requests`');
  }
}
