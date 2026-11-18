import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, QueryFailedError, Repository } from 'typeorm';
import {
  AttendanceView,
  CheckInPayload,
  countWorkingDays,
  FindAttendancesQuery,
  MonthlyStats,
  MonthlyStatsQuery,
  monthRange,
  Paginated,
  resolvePage,
  RpcErrors,
  toLocalDate,
  toLocalTime,
  toPaginated,
} from '@app/common';
import { Attendance } from './attendance.entity';

const MYSQL_DUPLICATE_ENTRY = 'ER_DUP_ENTRY';

@Injectable()
export class AttendanceService {
  constructor(@InjectRepository(Attendance) private readonly attendances: Repository<Attendance>) {}

  async checkIn({ employeeId, photoPath, notes }: CheckInPayload): Promise<AttendanceView> {
    const now = new Date();
    const attendanceDate = toLocalDate(now);

    const existing = await this.attendances.findOneBy({ employeeId, attendanceDate });
    if (existing) {
      throw alreadyCheckedIn(existing.checkInAt);
    }

    try {
      const attendance = this.attendances.create({
        employeeId,
        attendanceDate,
        checkInAt: now,
        photoPath,
        notes: notes?.trim() || null,
      });
      return (await this.attendances.save(attendance)).toView();
    } catch (error) {
      if (isDuplicateEntry(error)) throw alreadyCheckedIn(now);
      throw error;
    }
  }

  async findToday(employeeId: number): Promise<AttendanceView | null> {
    const attendance = await this.attendances.findOneBy({ employeeId, attendanceDate: toLocalDate(new Date()) });
    return attendance?.toView() ?? null;
  }

  async findAll(query: FindAttendancesQuery): Promise<Paginated<AttendanceView>> {
    const { page, limit, skip } = resolvePage(query);
    const builder = this.attendances
      .createQueryBuilder('attendance')
      .orderBy('attendance.attendanceDate', 'DESC')
      .addOrderBy('attendance.checkInAt', 'DESC');

    if (query.employeeId) {
      builder.andWhere('attendance.employeeId = :employeeId', { employeeId: query.employeeId });
    }
    if (query.employeeIds?.length) {
      builder.andWhere('attendance.employeeId IN (:...employeeIds)', { employeeIds: query.employeeIds });
    }
    if (query.from) {
      builder.andWhere('attendance.attendanceDate >= :from', { from: query.from });
    }
    if (query.to) {
      builder.andWhere('attendance.attendanceDate <= :to', { to: query.to });
    }

    const [rows, total] = await builder.skip(skip).take(limit).getManyAndCount();
    return toPaginated(
      rows.map((row) => row.toView()),
      total,
      page,
      limit,
    );
  }

  countByDate(date: string): Promise<number> {
    return this.attendances.countBy({ attendanceDate: date });
  }

  async monthlyStats({ employeeId, month }: MonthlyStatsQuery): Promise<MonthlyStats> {
    const { from, to: endOfMonth } = monthRange(month);
    const today = toLocalDate(new Date());
    const to = endOfMonth < today ? endOfMonth : today;

    const rows = from <= to ? await this.attendances.findBy({ employeeId, attendanceDate: Between(from, to) }) : [];
    const workingDays = from <= to ? countWorkingDays(from, to) : 0;

    return {
      month,
      daysPresent: rows.length,
      workingDays,
      attendanceRate: workingDays ? Math.min(100, Math.round((rows.length / workingDays) * 100)) : 0,
      averageCheckInTime: averageTimeOfDay(rows.map((row) => row.checkInAt)),
    };
  }
}

function alreadyCheckedIn(checkInAt: Date) {
  return RpcErrors.conflict(`Anda sudah absen hari ini pukul ${toLocalTime(new Date(checkInAt))} WIB`);
}

function isDuplicateEntry(error: unknown): boolean {
  return error instanceof QueryFailedError && (error.driverError as { code?: string })?.code === MYSQL_DUPLICATE_ENTRY;
}

function averageTimeOfDay(instants: Date[]): string | null {
  if (instants.length === 0) return null;

  const minutes = instants.map((instant) => {
    const [hours, mins] = toLocalTime(new Date(instant)).split(':').map(Number);
    return hours * 60 + mins;
  });
  const average = Math.round(minutes.reduce((sum, value) => sum + value, 0) / minutes.length);
  return `${String(Math.floor(average / 60)).padStart(2, '0')}:${String(average % 60).padStart(2, '0')}`;
}
