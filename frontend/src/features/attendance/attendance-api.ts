import { apiClient } from '@/lib/api-client';
import { Attendance, DailySummary, MonthlyStats, Paginated, TodayAttendance } from '@/types/api';

export interface AttendanceFilters {
  from?: string;
  to?: string;
  employeeId?: number;
  page?: number;
  limit?: number;
}

export const attendanceApi = {
  today: () => apiClient.get<TodayAttendance>('/attendances/today').then((response) => response.data),

  checkIn: (photo: File, notes?: string) => {
    const form = new FormData();
    form.append('photo', photo);
    if (notes?.trim()) form.append('notes', notes.trim());
    return apiClient.post<Attendance>('/attendances', form).then((response) => response.data);
  },

  mine: (month: string, page = 1, limit = 10) =>
    apiClient
      .get<Paginated<Attendance>>('/attendances/me', { params: { month, page, limit } })
      .then((response) => response.data),

  stats: (month: string, employeeId?: number) =>
    apiClient
      .get<MonthlyStats>('/attendances/stats', { params: { month, employeeId } })
      .then((response) => response.data),

  list: (filters: AttendanceFilters) =>
    apiClient
      .get<Paginated<Attendance>>('/attendances', { params: filters })
      .then((response) => response.data),

  summary: (date?: string) =>
    apiClient
      .get<DailySummary>('/attendances/summary', { params: { date } })
      .then((response) => response.data),
};
