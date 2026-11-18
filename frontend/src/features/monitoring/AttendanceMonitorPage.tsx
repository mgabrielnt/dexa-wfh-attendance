import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { Column, DataTable } from '@/components/ui/DataTable';
import { Icon } from '@/components/ui/Icon';
import { InfoNote } from '@/components/ui/InfoNote';
import { Pagination } from '@/components/ui/Pagination';
import { useAttendances } from '@/features/attendance/attendance-queries';
import { AttendancePhoto } from '@/features/attendance/components/AttendancePhoto';
import { AttendancePhotoModal } from '@/features/attendance/components/AttendancePhotoModal';
import { photoFileName } from '@/features/attendance/photo-file-name';
import { useEmployees } from '@/features/employees/employee-queries';
import { AdminPageHeader } from '@/layouts/AdminPageHeader';
import { cn } from '@/lib/cn';
import { formatMediumDate, formatTime, startOfMonthIso, todayIso } from '@/lib/datetime';
import { Attendance } from '@/types/api';

const EMPLOYEE_OPTIONS_LIMIT = 100;

interface Filters {
  from: string;
  to: string;
  employeeId: string;
}

const defaultFilters = (): Filters => ({ from: startOfMonthIso(todayIso()), to: todayIso(), employeeId: '' });

export function AttendanceMonitorPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<Attendance | null>(null);

  const { data: employeeOptions } = useEmployees({ limit: EMPLOYEE_OPTIONS_LIMIT });
  const { data, isLoading } = useAttendances({
    from: filters.from || undefined,
    to: filters.to || undefined,
    employeeId: filters.employeeId ? Number(filters.employeeId) : undefined,
    page,
  });

  const setFilter = (key: keyof Filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(defaultFilters());
    setPage(1);
  };

  const columns: Column<Attendance>[] = [
    {
      key: 'employee',
      header: 'Karyawan',
      render: (row) => (
        <span className="flex items-center gap-3">
          <Avatar name={row.employee?.fullName ?? '?'} />
          <span>
            <span className="block text-sm font-bold">
              {row.employee?.fullName ?? 'Karyawan tidak ditemukan'}
            </span>
            {row.employee && (
              <span className="text-[11px] font-medium text-muted">
                NIK {row.employee.employeeCode} · {row.employee.position}
              </span>
            )}
          </span>
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Tanggal',
      render: (row) => <span className="text-body">{formatMediumDate(row.checkInAt)}</span>,
    },
    {
      key: 'time',
      header: 'Jam masuk (server)',
      render: (row) => (
        <span className="text-sm font-bold tabular-nums">{formatTime(row.checkInAt)} WIB</span>
      ),
    },
    {
      key: 'photo',
      header: 'Foto bukti',
      render: (row) => (
        <span className="flex items-center gap-2.5 text-xs text-body-light">
          <AttendancePhoto
            photoUrl={row.photoUrl}
            alt={`foto bukti ${row.employee?.fullName ?? ''}`}
            onClick={() => setPreview(row)}
            className="h-8 w-11 rounded-md bg-ink"
          />
          <span className="max-w-[140px] truncate">{photoFileName(row.photoUrl)}</span>
        </span>
      ),
    },
    {
      key: 'notes',
      header: 'Catatan',
      render: (row) => (
        <span className={cn('text-xs', row.notes ? 'text-body' : 'text-muted-light')}>
          {row.notes ?? '—'}
        </span>
      ),
    },
    {
      key: 'detail',
      header: 'Detail',
      className: 'text-right',
      render: (row) => (
        <button
          type="button"
          aria-label="Lihat foto bukti"
          onClick={() => setPreview(row)}
          className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-border bg-white hover:bg-ink hover:text-white"
        >
          <Icon name="eye" size={16} />
        </button>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader title="ABSENSI" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Chip tone="dark" size="md" className="h-10 rounded-2xl">
          <Icon name="eye" size={14} /> Hanya lihat
        </Chip>
        <label className="flex items-center gap-2 text-xs font-medium text-muted">
          <span className="sr-only">Dari tanggal</span>
          <input
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(event) => setFilter('from', event.target.value)}
            className="filter-control"
          />
        </label>
        <span className="text-xs text-muted">–</span>
        <label className="flex items-center gap-2 text-xs font-medium text-muted">
          <span className="sr-only">Sampai tanggal</span>
          <input
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(event) => setFilter('to', event.target.value)}
            className="filter-control"
          />
        </label>
        <select
          aria-label="Filter karyawan"
          value={filters.employeeId}
          onChange={(event) => setFilter('employeeId', event.target.value)}
          className="filter-control select-chevron"
        >
          <option value="">Karyawan: Semua</option>
          {employeeOptions?.data.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.fullName}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={resetFilters}
          className="ml-auto text-xs font-semibold text-muted underline hover:text-ink"
        >
          Reset filter
        </button>
      </div>

      <section className="card pt-5">
        <DataTable
          columns={columns}
          rows={data?.data ?? []}
          rowKey={(row) => row.id}
          loading={isLoading}
          emptyMessage="Tidak ada absensi pada rentang ini"
          isRowHighlighted={(row) => row.id === preview?.id}
        />
        {data && <Pagination meta={data.meta} itemLabel="absensi" onPageChange={setPage} />}
      </section>

      <InfoNote>Admin HRD hanya dapat melihat absensi. Tidak ada aksi ubah atau hapus.</InfoNote>

      <AttendancePhotoModal attendance={preview} onClose={() => setPreview(null)} />
    </>
  );
}
