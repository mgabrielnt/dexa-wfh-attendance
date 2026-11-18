import { apiClient } from '@/lib/api-client';
import { Employee, EmployeeListItem, EmployeeStatus, Paginated } from '@/types/api';

export interface EmployeeFilters {
  search?: string;
  status?: EmployeeStatus;
  department?: string;
  page?: number;
  limit?: number;
}

export interface EmployeePayload {
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  joinDate: string;
  status?: EmployeeStatus;
  password?: string;
}

export const employeesApi = {
  list: (filters: EmployeeFilters) =>
    apiClient
      .get<Paginated<EmployeeListItem>>('/employees', { params: filters })
      .then((response) => response.data),

  get: (id: number) => apiClient.get<Employee>(`/employees/${id}`).then((response) => response.data),

  create: (payload: EmployeePayload) =>
    apiClient.post<Employee>('/employees', payload).then((response) => response.data),

  update: (id: number, payload: Partial<EmployeePayload>) =>
    apiClient.patch<Employee>(`/employees/${id}`, payload).then((response) => response.data),

  deactivate: (id: number) =>
    apiClient.delete<Employee>(`/employees/${id}`).then((response) => response.data),
};
