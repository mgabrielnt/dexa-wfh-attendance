import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { useDailySummary } from '@/features/attendance/attendance-queries';
import { cn } from '@/lib/cn';

function Stat({ value, label, dotClassName }: { value?: number; label: string; dotClassName: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[44px] font-medium leading-none tabular-nums">{value ?? '–'}</span>
      <span className="pt-1 text-xs font-medium leading-[15px] text-muted">
        <span className={cn('mb-1 block h-[7px] w-[7px] rounded-full', dotClassName)} />
        {label}
      </span>
    </div>
  );
}

interface AdminPageHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function AdminPageHeader({ title, actions }: AdminPageHeaderProps) {
  const { data: summary } = useDailySummary();

  return (
    <div className="mb-8 flex flex-wrap items-center gap-x-8 gap-y-4">
      <h1 className="text-[44px] font-extrabold leading-none tracking-tight sm:text-[56px]">{title}</h1>
      {actions ?? (
        <Link
          to="/admin/employees/new"
          className="inline-flex h-[42px] items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-soft"
        >
          <Icon name="plus" size={16} /> Tambah Karyawan
        </Link>
      )}
      <div className="flex gap-8 xl:ml-6">
        <Stat value={summary?.activeEmployees} label="Karyawan aktif" dotClassName="bg-success" />
        <Stat value={summary?.checkedIn} label="Sudah absen" dotClassName="bg-success" />
        <Stat value={summary?.notCheckedIn} label="Belum absen" dotClassName="bg-danger" />
      </div>
    </div>
  );
}
