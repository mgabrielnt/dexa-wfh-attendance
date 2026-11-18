import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/features/auth/auth-context';
import { EmployeePageHeader } from '@/layouts/EmployeePageHeader';
import { useTodayAttendance } from './attendance-queries';
import { CheckInForm } from './components/CheckInForm';
import { CheckInSuccess } from './components/CheckInSuccess';
import { RecentAttendanceCard } from './components/RecentAttendanceCard';
import { ServerClockCard } from './components/ServerClockCard';

export function CheckInPage() {
  const { profile } = useAuth();
  const { data: today, isLoading } = useTodayAttendance();
  const employee = profile?.employee;
  const attendance = today?.attendance ?? null;

  return (
    <>
      <EmployeePageHeader
        title={`Halo, ${employee?.fullName.split(' ')[0] ?? ''} 👋`}
        subtitle={employee ? `${employee.position} · ${employee.department}` : undefined}
      />

      <div className="mt-8 grid gap-4 md:grid-cols-[400px_1fr]">
        <ServerClockCard serverTime={today?.serverTime} checkedIn={Boolean(attendance)} />
        {isLoading ? (
          <div className="card grid place-items-center text-muted">
            <Spinner />
          </div>
        ) : attendance ? (
          <CheckInSuccess attendance={attendance} />
        ) : (
          <CheckInForm />
        )}
      </div>

      <RecentAttendanceCard />
    </>
  );
}
