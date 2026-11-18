import { Link } from 'react-router-dom';
import { Chip } from '@/components/ui/Chip';
import { Column, DataTable } from '@/components/ui/DataTable';
import { currentMonth, formatMediumDate, formatTime } from '@/lib/datetime';
import { Attendance } from '@/types/api';
import { useMyAttendances } from '../attendance-queries';
import { AttendancePhoto } from './AttendancePhoto';
import { photoFileName } from '../photo-file-name';

const RECENT_LIMIT = 3;

const columns: Column<Attendance>[] = [
  {
    key: 'date',
    header: 'Tanggal',
    render: (row) => <span className="font-semibold">{formatMediumDate(row.checkInAt)}</span>,
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
        <span className="h-[26px] w-9 overflow-hidden rounded-md bg-ink">
          <AttendancePhoto photoUrl={row.photoUrl} alt="Foto bukti" />
        </span>
        {photoFileName(row.photoUrl)}
      </span>
    ),
  },
  { key: 'status', header: 'Status', render: () => <Chip tone="success">✓ Tercatat</Chip> },
];

export function RecentAttendanceCard() {
  const { data, isLoading } = useMyAttendances(currentMonth(), 1, RECENT_LIMIT);

  return (
    <section className="mt-4 card pt-5">
      <div className="mb-3 flex items-center justify-between px-6">
        <h2 className="text-base font-bold">Riwayat Absen Saya</h2>
        <Link to="/employee/history" className="text-xs font-semibold text-muted hover:text-ink">
          Lihat semua →
        </Link>
      </div>
      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        emptyMessage="Belum ada absensi bulan ini"
      />
      {data && (
        <p className="px-6 pb-5 pt-3 text-[11px] font-medium text-muted-light">
          Menampilkan {data.data.length} dari {data.meta.total} absen bulan ini
        </p>
      )}
    </section>
  );
}
