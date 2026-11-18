import { useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import { Column, DataTable } from '@/components/ui/DataTable';
import { Icon } from '@/components/ui/Icon';
import { Pagination } from '@/components/ui/Pagination';
import { StatTile } from '@/components/ui/StatTile';
import { EmployeePageHeader } from '@/layouts/EmployeePageHeader';
import {
  currentMonth,
  formatMediumDate,
  formatMonth,
  formatTime,
  shiftMonth,
  todayIso,
} from '@/lib/datetime';
import { Attendance } from '@/types/api';
import { useMonthlyStats, useMyAttendances } from './attendance-queries';
import { AttendancePhoto } from './components/AttendancePhoto';
import { AttendancePhotoModal } from './components/AttendancePhotoModal';
import { photoFileName } from './photo-file-name';

export function HistoryPage() {
  const thisMonth = currentMonth();
  const [month, setMonth] = useState(thisMonth);
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<Attendance | null>(null);

  const { data: stats } = useMonthlyStats(month);
  const { data, isLoading } = useMyAttendances(month, page);

  const changeMonth = (delta: number) => {
    setMonth((current) => shiftMonth(current, delta));
    setPage(1);
  };

  const columns: Column<Attendance>[] = [
    {
      key: 'date',
      header: 'Tanggal',
      render: (row) => (
        <span className="flex items-center gap-2 font-semibold">
          {formatMediumDate(row.checkInAt)}
          {row.attendanceDate === todayIso() && <Chip tone="success">Hari ini</Chip>}
        </span>
      ),
    },
    {
      key: 'time',
      header: 'Jam masuk',
      render: (row) => <span className="font-bold">{formatTime(row.checkInAt)} WIB</span>,
    },
    {
      key: 'photo',
      header: 'Foto bukti',
      render: (row) => (
        <span className="flex items-center gap-2.5 text-xs text-body-light">
          <AttendancePhoto
            photoUrl={row.photoUrl}
            alt="foto bukti"
            onClick={() => setPreview(row)}
            className="h-[30px] w-10 rounded-md bg-ink"
          />
          {photoFileName(row.photoUrl)}
        </span>
      ),
    },
    {
      key: 'notes',
      header: 'Catatan',
      render: (row) => (
        <span className={row.notes ? 'text-body' : 'text-muted-light'}>{row.notes ?? '—'}</span>
      ),
    },
  ];

  return (
    <>
      <EmployeePageHeader title="Riwayat Absen" subtitle="Semua absensi WFH kamu · hanya bisa dilihat" />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Hadir bulan ini"
          value={`${stats?.daysPresent ?? 0} hari`}
          caption={`dari ${stats?.workingDays ?? 0} hari kerja`}
        />
        <StatTile label="Rata-rata jam masuk" value={stats?.averageCheckInTime ?? '—'} />
        <StatTile tone="dark" label="Kehadiran" value={`${stats?.attendanceRate ?? 0}%`} />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-2xl bg-white p-1">
          <button
            type="button"
            aria-label="Bulan sebelumnya"
            onClick={() => changeMonth(-1)}
            className="grid h-8 w-8 place-items-center rounded-xl hover:bg-soft"
          >
            <Icon name="chevronLeft" size={16} />
          </button>
          <span className="min-w-[130px] text-center text-xs font-semibold">{formatMonth(month)}</span>
          <button
            type="button"
            aria-label="Bulan berikutnya"
            disabled={month >= thisMonth}
            onClick={() => changeMonth(1)}
            className="grid h-8 w-8 place-items-center rounded-xl hover:bg-soft disabled:opacity-30"
          >
            <Icon name="chevronRight" size={16} />
          </button>
        </div>
        <span className="text-xs font-medium text-muted">{data?.meta.total ?? 0} absensi</span>
      </div>

      <section className="card mt-3 pt-5">
        <DataTable
          columns={columns}
          rows={data?.data ?? []}
          rowKey={(row) => row.id}
          loading={isLoading}
          emptyMessage="Tidak ada absensi pada bulan ini"
        />
        {data && <Pagination meta={data.meta} itemLabel="absensi" onPageChange={setPage} />}
      </section>

      <AttendancePhotoModal attendance={preview} onClose={() => setPreview(null)} />
    </>
  );
}
