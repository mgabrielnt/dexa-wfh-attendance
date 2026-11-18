import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttendancesTable1731700000002 implements MigrationInterface {
  name = 'CreateAttendancesTable1731700000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE attendances (
        id              INT          NOT NULL AUTO_INCREMENT,
        employee_id     INT          NOT NULL,
        attendance_date DATE         NOT NULL,
        check_in_at     DATETIME     NOT NULL,
        photo_path      VARCHAR(255) NOT NULL,
        notes           VARCHAR(255) NULL,
        created_at      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY uq_attendances_employee_date (employee_id, attendance_date),
        KEY idx_attendances_date (attendance_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE attendances');
  }
}
