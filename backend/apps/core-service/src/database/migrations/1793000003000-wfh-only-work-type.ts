import { MigrationInterface, QueryRunner } from 'typeorm';

export class WfhOnlyWorkType1793000003000 implements MigrationInterface {
  name = 'WfhOnlyWorkType1793000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("UPDATE `attendances` SET `work_type` = 'WFH' WHERE `work_type` <> 'WFH'");
    await queryRunner.query(
      "ALTER TABLE `attendances` MODIFY `work_type` enum('WFH') NOT NULL DEFAULT 'WFH'",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `attendances` MODIFY `work_type` enum('WFH', 'WFO') NOT NULL DEFAULT 'WFH'",
    );
  }
}
