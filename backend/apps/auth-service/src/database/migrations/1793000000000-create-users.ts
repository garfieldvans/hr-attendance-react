import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1793000000000 implements MigrationInterface {
  name = 'CreateUsers1793000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT,
        \`employee_code\` varchar(20) NOT NULL,
        \`name\` varchar(100) NOT NULL,
        \`email\` varchar(100) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`role\` enum('EMPLOYEE', 'HRD') NOT NULL,
        \`position\` varchar(100) NULL,
        \`department\` varchar(100) NULL,
        \`phone\` varchar(20) NULL,
        \`join_date\` date NULL,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`uq_users_employee_code\` (\`employee_code\`),
        UNIQUE INDEX \`uq_users_email\` (\`email\`)
      ) ENGINE = InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `users`');
  }
}
