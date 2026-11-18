import { PageQuery } from './pagination.contract';

export interface AttendanceView {
  id: number;
  employeeId: number;
  attendanceDate: string;
  checkInAt: Date;
  photoPath: string;
  notes: string | null;
}

export interface CheckInPayload {
  employeeId: number;
  photoPath: string;
  notes?: string | null;
}

export interface FindAttendancesQuery extends PageQuery {
  employeeId?: number;
  employeeIds?: number[];
  from?: string;
  to?: string;
}

export interface MonthlyStatsQuery {
  employeeId: number;
  month: string;
}

export interface MonthlyStats {
  month: string;
  daysPresent: number;
  workingDays: number;
  attendanceRate: number;
  averageCheckInTime: string | null;
}
