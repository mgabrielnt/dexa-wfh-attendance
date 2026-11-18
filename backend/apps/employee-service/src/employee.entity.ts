import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { EmployeeStatus, EmployeeView } from '@app/common';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'employee_code', length: 20, unique: true })
  employeeCode: string;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ length: 50 })
  position: string;

  @Column({ length: 50 })
  department: string;

  @Column({ name: 'join_date', type: 'date' })
  joinDate: string;

  @Column({ type: 'enum', enum: EmployeeStatus, default: EmployeeStatus.Active })
  status: EmployeeStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  toView(): EmployeeView {
    return {
      id: this.id,
      employeeCode: this.employeeCode,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      position: this.position,
      department: this.department,
      joinDate: this.joinDate,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
