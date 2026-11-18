import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { AttendancePhoto } from '@/features/attendance/components/AttendancePhoto';
import { photoFileName } from '@/features/attendance/photo-file-name';
import { cn } from '@/lib/cn';
import { formatLongDate, formatTime } from '@/lib/datetime';
import { Attendance } from '@/types/api';

interface AttendanceCardProps {
  attendance: Attendance;
  selected: boolean;
  onSelect: () => void;
}

export function AttendanceCard({ attendance, selected, onSelect }: AttendanceCardProps) {
  const name = attendance.employee?.fullName ?? 'Karyawan';

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'flex flex-col rounded-3xl p-4 text-left transition',
        selected ? 'bg-lime' : 'bg-white hover:ring-1 hover:ring-border',
      )}
    >
      <span className="flex items-center gap-2.5">
        <Avatar name={name} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold">{name}</span>
          <span
            className={cn(
              'block truncate text-[11px] font-medium',
              selected ? 'text-lime-olive' : 'text-muted',
            )}
          >
            {attendance.employee?.position}
          </span>
        </span>
      </span>

      <span className="relative mt-3.5 block h-[98px] overflow-hidden rounded-[14px] bg-ink">
        <AttendancePhoto photoUrl={attendance.photoUrl} alt={`Foto bukti ${name}`} />
        <span className="absolute bottom-2.5 left-3 max-w-[85%] truncate text-[11px] font-semibold text-white drop-shadow">
          {photoFileName(attendance.photoUrl)}
        </span>
      </span>

      <span className={cn('mt-4 text-xs font-medium', selected ? 'text-lime-olive' : 'text-muted')}>
        {formatLongDate(attendance.checkInAt)}
      </span>
      <span className="mt-1 flex items-center justify-between">
        <span className="text-2xl font-bold tabular-nums">{formatTime(attendance.checkInAt)} WIB</span>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-white">
          <Icon name="arrowRight" size={18} />
        </span>
      </span>
    </button>
  );
}
