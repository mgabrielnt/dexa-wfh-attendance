import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1731700000000 implements MigrationInterface {
  name = 'CreateUsersTable1731700000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id            INT          NOT NULL AUTO_INCREMENT,
        employee_id   INT          NULL,
        email         VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role          ENUM('ADMIN', 'EMPLOYEE') NOT NULL,
        is_active     TINYINT(1)   NOT NULL DEFAULT 1,
        created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY uq_users_email (email),
        UNIQUE KEY uq_users_employee_id (employee_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE users');
  }
}
