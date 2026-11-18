import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { AttendanceView } from '@app/common';

@Entity('attendances')
@Index('uq_attendances_employee_date', ['employeeId', 'attendanceDate'], { unique: true })
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'employee_id', type: 'int' })
  employeeId: number;

  @Column({ name: 'attendance_date', type: 'date' })
  attendanceDate: string;

  @Column({ name: 'check_in_at', type: 'datetime' })
  checkInAt: Date;

  @Column({ name: 'photo_path', length: 255 })
  photoPath: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  toView(): AttendanceView {
    return {
      id: this.id,
      employeeId: this.employeeId,
      attendanceDate: this.attendanceDate,
      checkInAt: this.checkInAt,
      photoPath: this.photoPath,
      notes: this.notes,
    };
  }
}
