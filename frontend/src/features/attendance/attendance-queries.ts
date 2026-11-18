import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AttendanceFilters, attendanceApi } from './attendance-api';

export const attendanceKeys = {
  all: ['attendance'] as const,
  today: () => [...attendanceKeys.all, 'today'] as const,
  mine: (month: string, page: number, limit: number) =>
    [...attendanceKeys.all, 'mine', month, page, limit] as const,
  stats: (month: string, employeeId?: number) => [...attendanceKeys.all, 'stats', month, employeeId] as const,
  list: (filters: AttendanceFilters) => [...attendanceKeys.all, 'list', filters] as const,
  summary: (date?: string) => [...attendanceKeys.all, 'summary', date] as const,
};

export function useTodayAttendance() {
  return useQuery({ queryKey: attendanceKeys.today(), queryFn: attendanceApi.today });
}

export function useMyAttendances(month: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: attendanceKeys.mine(month, page, limit),
    queryFn: () => attendanceApi.mine(month, page, limit),
    placeholderData: keepPreviousData,
  });
}

export function useMonthlyStats(month: string, employeeId?: number, enabled = true) {
  return useQuery({
    queryKey: attendanceKeys.stats(month, employeeId),
    queryFn: () => attendanceApi.stats(month, employeeId),
    enabled,
  });
}

export function useAttendances(filters: AttendanceFilters, enabled = true) {
  return useQuery({
    queryKey: attendanceKeys.list(filters),
    queryFn: () => attendanceApi.list(filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useDailySummary(date?: string) {
  return useQuery({ queryKey: attendanceKeys.summary(date), queryFn: () => attendanceApi.summary(date) });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ photo, notes }: { photo: File; notes?: string }) => attendanceApi.checkIn(photo, notes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
  });
}
