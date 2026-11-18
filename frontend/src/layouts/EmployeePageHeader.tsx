import { Chip } from '@/components/ui/Chip';
import { useTodayAttendance } from '@/features/attendance/attendance-queries';
import { formatShortTime } from '@/lib/datetime';

interface EmployeePageHeaderProps {
  title: string;
  subtitle?: string;
}

export function EmployeePageHeader({ title, subtitle }: EmployeePageHeaderProps) {
  const { data: today, isLoading } = useTodayAttendance();
  const attendance = today?.attendance;

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[40px] font-extrabold leading-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm font-medium text-muted">{subtitle}</p>}
      </div>
      {!isLoading && (
        <Chip tone="white" dot dotTone={attendance ? 'success' : 'danger'} size="md">
          {attendance ? `Sudah absen · ${formatShortTime(attendance.checkInAt)} WIB` : 'Belum absen hari ini'}
        </Chip>
      )}
    </div>
  );
}
