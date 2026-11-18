import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { formatLongDate, formatTime } from '@/lib/datetime';
import { Attendance } from '@/types/api';
import { AttendancePhoto } from './AttendancePhoto';
import { photoFileName } from '../photo-file-name';

export function CheckInSuccess({ attendance }: { attendance: Attendance }) {
  return (
    <section className="flex flex-col items-center card p-6 text-center">
      <span className="mt-2 grid h-[72px] w-[72px] place-items-center rounded-full bg-lime">
        <Icon name="check" size={34} strokeWidth={2.6} />
      </span>
      <h2 className="mt-4 text-xl font-bold">Absen berhasil tercatat</h2>
      <p className="mt-1 text-[13px] font-medium text-muted">{formatLongDate(attendance.checkInAt)}</p>
      <p className="mt-1 text-[34px] font-bold tabular-nums">{formatTime(attendance.checkInAt)} WIB</p>
      <span className="mt-1 rounded-xl bg-soft px-2.5 py-1 text-[11px] font-semibold text-body-light">
        waktu dari server
      </span>

      <div className="relative mt-5 h-[120px] w-full overflow-hidden rounded-2xl bg-ink">
        <AttendancePhoto photoUrl={attendance.photoUrl} alt="Foto bukti WFH yang dikirim" />
        <span className="absolute bottom-3 left-3 rounded-xl bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-white">
          {photoFileName(attendance.photoUrl)}
        </span>
      </div>
      {attendance.notes && (
        <p className="mt-3 self-start text-xs font-medium text-body-light">Catatan: {attendance.notes}</p>
      )}

      <Button size="lg" fullWidth disabled className="mt-4">
        <Icon name="check" size={16} /> Sudah absen hari ini
      </Button>
      <p className="mt-2 text-[11px] font-medium text-muted">Absen berikutnya dapat dilakukan besok.</p>
    </section>
  );
}
