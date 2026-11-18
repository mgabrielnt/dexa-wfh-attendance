export const AuthPattern = {
  Login: 'auth.login',
  CreateUser: 'auth.user.create',
  UpdateUser: 'auth.user.update',
} as const;

export const EmployeePattern = {
  Create: 'employee.create',
  Update: 'employee.update',
  Deactivate: 'employee.deactivate',
  Purge: 'employee.purge',
  FindAll: 'employee.find-all',
  FindOne: 'employee.find-one',
  FindByIds: 'employee.find-by-ids',
  CountActive: 'employee.count-active',
} as const;

export const AttendancePattern = {
  CheckIn: 'attendance.check-in',
  FindToday: 'attendance.find-today',
  FindAll: 'attendance.find-all',
  CountByDate: 'attendance.count-by-date',
  MonthlyStats: 'attendance.monthly-stats',
} as const;
