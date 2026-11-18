import { createBrowserRouter, Navigate } from 'react-router-dom';
import { CheckInPage } from '@/features/attendance/CheckInPage';
import { HistoryPage } from '@/features/attendance/HistoryPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { HomeRedirect, RequireRole } from '@/features/auth/RequireRole';
import { EmployeeFormPage } from '@/features/employees/EmployeeFormPage';
import { EmployeesPage } from '@/features/employees/EmployeesPage';
import { AttendanceMonitorPage } from '@/features/monitoring/AttendanceMonitorPage';
import { DashboardPage } from '@/features/monitoring/DashboardPage';
import { AdminLayout } from '@/layouts/AdminLayout';
import { EmployeeLayout } from '@/layouts/EmployeeLayout';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/', element: <HomeRedirect /> },
  {
    element: <RequireRole role="EMPLOYEE" />,
    children: [
      {
        path: '/employee',
        element: <EmployeeLayout />,
        children: [
          { index: true, element: <Navigate to="attendance" replace /> },
          { path: 'attendance', element: <CheckInPage /> },
          { path: 'history', element: <HistoryPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireRole role="ADMIN" />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'employees', element: <EmployeesPage /> },
          { path: 'employees/new', element: <EmployeeFormPage /> },
          { path: 'employees/:id/edit', element: <EmployeeFormPage /> },
          { path: 'attendances', element: <AttendanceMonitorPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
