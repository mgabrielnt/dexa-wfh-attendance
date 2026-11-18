import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { StatTile } from '@/components/ui/StatTile';
import { useAttendances, useMonthlyStats } from '@/features/attendance/attendance-queries';
import { AttendancePhoto } from '@/features/attendance/components/AttendancePhoto';
import { cn } from '@/lib/cn';
import { currentMonth, formatMediumDate, formatMonth, formatShortTime, formatTime } from '@/lib/datetime';
import { Attendance } from '@/types/api';

const RECENT_DAYS = 5;

interface AttendanceDetailPanelProps {
  attendance: Attendance | null;
  onOpenPhoto: (attendance: Attendance) => void;
}

export function AttendanceDetailPanel({ attendance, onOpenPhoto }: AttendanceDetailPanelProps) {
  const month = currentMonth();
  const employeeId = attendance?.employeeId;
  const { data: stats } = useMonthlyStats(month, employeeId, Boolean(employeeId));
  const { data: recent } = useAttendances({ employeeId, limit: RECENT_DAYS }, Boolean(employeeId));

  if (!attendance) {
    return (
      <aside className="grid min-h-[480px] place-items-center panel-dark p-8 text-center text-sm font-medium text-on-dark">
        Pilih salah satu absensi untuk melihat foto bukti dan detailnya.
      </aside>
    );
  }

  return (
    <aside className="panel-dark p-3">
      <div className="relative h-[300px] overflow-hidden rounded-3xl bg-ink-muted">
        <AttendancePhoto photoUrl={attendance.photoUrl} alt="Foto bukti WFH" />
        <span className="absolute left-3.5 top-3.5 rounded-[14px] bg-ink-night/70 px-3 py-1.5 text-[11px] font-semibold text-lime">
          Foto bukti WFH
        </span>
        <button
          type="button"
          aria-label="Perbesar foto"
          onClick={() => onOpenPhoto(attendance)}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-ink-night/70 hover:bg-ink-night"
        >
          <Icon name="eye" size={15} />
        </button>
        <span className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-2 rounded-[14px] bg-ink-night/80 px-3 py-1.5 text-[11px] font-semibold">
          <span className="h-[7px] w-[7px] rounded-full bg-lime" />
          {formatMediumDate(attendance.checkInAt)} · {formatTime(attendance.checkInAt)} WIB (dicatat server)
        </span>
      </div>

      <div className="px-3 pb-3">
        <div className="mt-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Detail Absensi</h2>
          <span className="rounded-xl bg-ink-raised px-2.5 py-1 text-[11px] font-semibold text-on-dark">
            Hanya lihat
          </span>
        </div>

        {attendance.employee && (
          <div className="mt-4 flex items-center gap-3 rounded-[18px] bg-ink-soft p-4">
            <Avatar name={attendance.employee.fullName} />
            <div>
              <p className="text-[15px] font-bold">{attendance.employee.fullName}</p>
              <p className="text-[11px] font-medium text-muted">
                {attendance.employee.position} · {attendance.employee.department} · NIK{' '}
                {attendance.employee.employeeCode}
              </p>
            </div>
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3">
          <StatTile
            tone="panel"
            label="Kehadiran"
            value={<span className="text-lime">{stats?.attendanceRate ?? 0}%</span>}
            caption="Bulan ini"
          />
          <StatTile
            tone="panel"
            label="Hari absen"
            value={`${stats?.daysPresent ?? 0}/${stats?.workingDays ?? 0}`}
            caption={formatMonth(month)}
          />
        </div>

        <div className="mt-3 rounded-[18px] bg-ink-soft p-4">
          <p className="text-[13px] font-semibold">Riwayat absen</p>
          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {(recent?.data ?? []).map((item) => {
              const selected = item.id === attendance.id;
              return (
                <div
                  key={item.id}
                  className={cn(
                    'rounded-xl py-2.5 text-center',
                    selected ? 'bg-lime text-ink' : 'bg-ink-muted text-white',
                  )}
                >
                  <p className={cn('text-[10px] font-medium', selected ? 'text-lime-olive' : 'text-muted')}>
                    {formatMediumDate(item.checkInAt).split(',')[0]} {item.attendanceDate.slice(8)}
                  </p>
                  <p className="text-[13px] font-bold tabular-nums">{formatShortTime(item.checkInAt)}</p>
                </div>
              );
            })}
          </div>
        </div>

        <Link
          to={`/admin/employees/${attendance.employeeId}/edit`}
          className="mt-4 flex h-12 items-center justify-center gap-2 rounded-full bg-lime text-sm font-bold text-ink hover:brightness-95"
        >
          <Icon name="edit" size={15} /> Edit Data Karyawan
        </Link>
      </div>
    </aside>
  );
}
