import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { formatLongDate, formatTime } from '@/lib/datetime';
import { Attendance } from '@/types/api';
import { AttendancePhoto } from './AttendancePhoto';
import { photoFileName } from '../photo-file-name';

interface AttendancePhotoModalProps {
  attendance: Attendance | null;
  onClose: () => void;
}

export function AttendancePhotoModal({ attendance, onClose }: AttendancePhotoModalProps) {
  if (!attendance) return null;

  const details = [
    attendance.employee && {
      label: 'Karyawan',
      value: `${attendance.employee.fullName} · NIK ${attendance.employee.employeeCode}`,
    },
    { label: 'Tanggal', value: formatLongDate(attendance.checkInAt) },
    { label: 'Jam masuk', value: `${formatTime(attendance.checkInAt)} WIB (dicatat server)`, strong: true },
    { label: 'Catatan', value: attendance.notes ?? '—' },
  ].filter(Boolean) as { label: string; value: string; strong?: boolean }[];

  return (
    <Modal
      open
      title="Foto Bukti Absensi"
      onClose={onClose}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Chip size="md">
            <Icon name="eye" size={14} /> Hanya lihat — absensi tidak dapat diubah
          </Chip>
          <Button variant="dark" onClick={onClose}>
            Tutup
          </Button>
        </div>
      }
    >
      <div className="relative h-[330px] overflow-hidden rounded-[20px] bg-ink">
        <AttendancePhoto photoUrl={attendance.photoUrl} alt="Foto bukti WFH" />
        <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-xl bg-ink/80 px-3 py-1.5 text-[11px] font-semibold text-white">
          <span className="h-[7px] w-[7px] rounded-full bg-lime" />
          {photoFileName(attendance.photoUrl)}
        </span>
      </div>

      <dl className="mt-5">
        {details.map(({ label, value, strong }) => (
          <div key={label} className="grid grid-cols-[120px_1fr] gap-3 border-b border-line py-2.5">
            <dt className="text-xs font-medium text-muted">{label}</dt>
            <dd className={strong ? 'text-sm font-bold' : 'text-sm font-semibold'}>{value}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
