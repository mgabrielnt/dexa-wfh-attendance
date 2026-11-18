export type Role = 'ADMIN' | 'EMPLOYEE';
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  position: string;
  department: string;
  joinDate: string;
  status: EmployeeStatus;
}

export interface EmployeeListItem extends Employee {
  todayCheckInAt: string | null;
}

type EmployeeSummary = Pick<Employee, 'id' | 'fullName' | 'employeeCode' | 'position' | 'department'>;

export interface Attendance {
  id: number;
  employeeId: number;
  attendanceDate: string;
  checkInAt: string;
  photoUrl: string;
  notes: string | null;
  employee?: EmployeeSummary | null;
}

export interface TodayAttendance {
  serverTime: string;
  attendance: Attendance | null;
}

export interface MonthlyStats {
  month: string;
  daysPresent: number;
  workingDays: number;
  attendanceRate: number;
  averageCheckInTime: string | null;
}

export interface DailySummary {
  date: string;
  activeEmployees: number;
  checkedIn: number;
  notCheckedIn: number;
}

export interface SessionProfile {
  user: { id: number; email: string; role: Role; employeeId: number | null };
  employee: Employee | null;
}

export interface LoginResponse extends SessionProfile {
  accessToken: string;
}
