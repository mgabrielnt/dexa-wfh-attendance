import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Chip, FilterChip } from '@/components/ui/Chip';
import { Column, DataTable } from '@/components/ui/DataTable';
import { Icon } from '@/components/ui/Icon';
import { InfoNote } from '@/components/ui/InfoNote';
import { Pagination } from '@/components/ui/Pagination';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { AdminPageHeader } from '@/layouts/AdminPageHeader';
import { cn } from '@/lib/cn';
import { formatPlainDate, formatShortTime } from '@/lib/datetime';
import { EmployeeListItem, EmployeeStatus } from '@/types/api';
import { StatusChangeDialog } from './components/StatusChangeDialog';
import { DEPARTMENTS } from './employee-form-schema';
import { useEmployees } from './employee-queries';

const STATUS_FILTERS: { label: string; value?: EmployeeStatus; dot?: string }[] = [
  { label: 'Semua' },
  { label: 'Aktif', value: 'ACTIVE', dot: 'bg-success' },
  { label: 'Nonaktif', value: 'INACTIVE', dot: 'bg-muted-light' },
];

const actionButton =
  'inline-flex h-7 items-center gap-1 rounded-xl px-2.5 text-[11px] font-semibold transition';

export function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EmployeeStatus>();
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [statusTarget, setStatusTarget] = useState<EmployeeListItem | null>(null);

  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading } = useEmployees({
    search: debouncedSearch || undefined,
    status,
    department: department || undefined,
    page,
  });

  const updateFilter =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const columns: Column<EmployeeListItem>[] = [
    {
      key: 'name',
      header: 'Karyawan',
      render: (row) => (
        <span className="flex items-center gap-3">
          <Avatar name={row.fullName} muted={row.status === 'INACTIVE'} />
          <span>
            <span className={cn('block text-sm font-bold', row.status === 'INACTIVE' && 'text-muted-light')}>
              {row.fullName}
            </span>
            <span className="text-[11px] font-medium text-muted">{row.email}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'code',
      header: 'NIK',
      render: (row) => <span className="font-semibold">{row.employeeCode}</span>,
    },
    { key: 'department', header: 'Departemen', render: (row) => <Chip>{row.department}</Chip> },
    {
      key: 'position',
      header: 'Jabatan',
      render: (row) => <span className="text-body">{row.position}</span>,
    },
    {
      key: 'joinDate',
      header: 'Bergabung',
      render: (row) => <span className="text-body">{formatPlainDate(row.joinDate)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) =>
        row.status === 'ACTIVE' ? (
          <Chip tone="success" dot>
            Aktif
          </Chip>
        ) : (
          <Chip tone="muted" dot>
            Nonaktif
          </Chip>
        ),
    },
    {
      key: 'today',
      header: 'Absen hari ini',
      render: (row) =>
        row.status === 'INACTIVE' ? (
          <span className="text-muted-light">—</span>
        ) : (
          <span className="flex items-center gap-2 text-xs font-semibold">
            <span
              className={cn('h-[7px] w-[7px] rounded-full', row.todayCheckInAt ? 'bg-success' : 'bg-danger')}
            />
            {row.todayCheckInAt ? `${formatShortTime(row.todayCheckInAt)} WIB` : 'Belum absen'}
          </span>
        ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row) => (
        <span className="flex gap-1.5">
          <Link
            to={`/admin/employees/${row.id}/edit`}
            className={cn(actionButton, 'border border-border bg-white hover:bg-soft')}
          >
            <Icon name="edit" size={12} /> Edit
          </Link>
          <button
            type="button"
            onClick={() => setStatusTarget(row)}
            className={cn(
              actionButton,
              row.status === 'ACTIVE'
                ? 'bg-danger-soft text-danger-ink hover:brightness-95'
                : 'bg-lime-soft text-lime-ink hover:brightness-95',
            )}
          >
            <Icon name={row.status === 'ACTIVE' ? 'ban' : 'refresh'} size={12} />
            {row.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
        </span>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader title="KARYAWAN" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex h-11 w-full items-center gap-2 rounded-full bg-white px-4 sm:w-[380px]">
          <Icon name="search" size={16} className="text-muted" />
          <span className="sr-only">Cari karyawan</span>
          <input
            value={search}
            onChange={(event) => updateFilter(setSearch)(event.target.value)}
            placeholder="Cari nama, NIK, atau email…"
            className="w-full bg-transparent text-[13px] font-medium outline-none placeholder:text-muted-light"
          />
        </label>
        {STATUS_FILTERS.map((filter) => (
          <FilterChip
            key={filter.label}
            selected={status === filter.value}
            dotClassName={filter.dot}
            onClick={() => updateFilter(setStatus)(filter.value)}
          >
            {filter.label}
          </FilterChip>
        ))}
        <select
          aria-label="Filter departemen"
          value={department}
          onChange={(event) => updateFilter(setDepartment)(event.target.value)}
          className="filter-control select-chevron h-9"
        >
          <option value="">Departemen: Semua</option>
          {DEPARTMENTS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <section className="card pt-5">
        <DataTable
          columns={columns}
          rows={data?.data ?? []}
          rowKey={(row) => row.id}
          loading={isLoading}
          emptyMessage="Tidak ada karyawan yang cocok dengan filter"
        />
        {data && <Pagination meta={data.meta} itemLabel="karyawan" onPageChange={setPage} />}
      </section>

      <InfoNote>Nonaktifkan = soft delete: akun tidak bisa login, riwayat absensi tetap tersimpan.</InfoNote>

      <StatusChangeDialog employee={statusTarget} onClose={() => setStatusTarget(null)} />
    </>
  );
}
