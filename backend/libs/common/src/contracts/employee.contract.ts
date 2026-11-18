import { EmployeeStatus } from '../enums';
import { PageQuery } from './pagination.contract';

export interface EmployeeView {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  position: string;
  department: string;
  joinDate: string;
  status: EmployeeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeePayload {
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string | null;
  position: string;
  department: string;
  joinDate: string;
}

export interface UpdateEmployeePayload extends Partial<CreateEmployeePayload> {
  id: number;
  status?: EmployeeStatus;
}

export interface FindEmployeesQuery extends PageQuery {
  search?: string;
  status?: EmployeeStatus;
  department?: string;
}
