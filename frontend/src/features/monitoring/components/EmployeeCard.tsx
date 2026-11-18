import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { formatShortTime } from '@/lib/datetime';
import { EmployeeListItem } from '@/types/api';

export function EmployeeCard({ employee }: { employee: EmployeeListItem }) {
  const checkedIn = Boolean(employee.todayCheckInAt);

  return (
    <article className="flex flex-col rounded-[22px] bg-white p-4">
      <Avatar name={employee.fullName} size="lg" />
      <h3 className="mt-4 truncate text-base font-bold">{employee.fullName}</h3>
      <p className="truncate text-xs font-medium text-muted">
        {employee.position} · {employee.employeeCode}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip>{employee.department}</Chip>
      </div>
      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="flex items-center gap-2 text-xs font-semibold">
          <span className={cn('h-2 w-2 rounded-full', checkedIn ? 'bg-success' : 'bg-danger')} />
          {checkedIn ? `Absen ${formatShortTime(employee.todayCheckInAt!)}` : 'Belum absen'}
        </span>
        <Link
          to={`/admin/employees/${employee.id}/edit`}
          className="inline-flex h-7 items-center gap-1 rounded-xl border border-border px-2.5 text-[11px] font-semibold hover:bg-soft"
        >
          <Icon name="edit" size={12} /> Edit
        </Link>
      </div>
    </article>
  );
}
