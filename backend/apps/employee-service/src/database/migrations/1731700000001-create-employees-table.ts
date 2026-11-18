import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmployeesTable1731700000001 implements MigrationInterface {
  name = 'CreateEmployeesTable1731700000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE employees (
        id            INT          NOT NULL AUTO_INCREMENT,
        employee_code VARCHAR(20)  NOT NULL,
        full_name     VARCHAR(100) NOT NULL,
        email         VARCHAR(100) NOT NULL,
        phone         VARCHAR(20)  NULL,
        position      VARCHAR(50)  NOT NULL,
        department    VARCHAR(50)  NOT NULL,
        join_date     DATE         NOT NULL,
        status        ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
        created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY uq_employees_code (employee_code),
        UNIQUE KEY uq_employees_email (email),
        KEY idx_employees_full_name (full_name),
        KEY idx_employees_status_department (status, department)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE employees');
  }
}
