import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceKeys } from '@/features/attendance/attendance-queries';
import { EmployeeStatus } from '@/types/api';
import { EmployeeFilters, EmployeePayload, employeesApi } from './employees-api';

const employeeKeys = {
  all: ['employees'] as const,
  list: (filters: EmployeeFilters) => [...employeeKeys.all, 'list', filters] as const,
  detail: (id: number) => [...employeeKeys.all, 'detail', id] as const,
};

export function useEmployees(filters: EmployeeFilters) {
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => employeesApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useEmployee(id: number | undefined) {
  return useQuery({
    queryKey: employeeKeys.detail(id ?? 0),
    queryFn: () => employeesApi.get(id!),
    enabled: Boolean(id),
  });
}

function useInvalidateEmployees() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: employeeKeys.all }),
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
    ]);
}

export function useSaveEmployee(id?: number) {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (payload: EmployeePayload) =>
      id ? employeesApi.update(id, payload) : employeesApi.create(payload),
    onSuccess: invalidate,
  });
}

export function useChangeEmployeeStatus() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: EmployeeStatus }) =>
      status === 'INACTIVE' ? employeesApi.deactivate(id) : employeesApi.update(id, { status }),
    onSuccess: invalidate,
  });
}
