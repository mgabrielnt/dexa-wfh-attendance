import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PhotoCapture } from '@/components/ui/PhotoCapture';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/toast-context';
import { getErrorMessage } from '@/lib/api-client';
import { formatTime } from '@/lib/datetime';
import { useCheckIn } from '../attendance-queries';

const NOTES_MAX_LENGTH = 255;

export function CheckInForm() {
  const toast = useToast();
  const checkIn = useCheckIn();
  const [photo, setPhoto] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!photo) return;

    try {
      const attendance = await checkIn.mutateAsync({ photo, notes });
      toast.success(`Absen berhasil tercatat · ${formatTime(attendance.checkInAt)} WIB`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Absen gagal dikirim'));
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col card p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold">Foto bukti WFH</h2>
        <span className="text-[11px] font-semibold text-danger-ink">Wajib</span>
      </div>

      <PhotoCapture value={photo} onChange={setPhoto} disabled={checkIn.isPending} />

      <TextField
        label="Catatan (opsional)"
        placeholder="Contoh: lanjut task API absensi"
        value={notes}
        maxLength={NOTES_MAX_LENGTH}
        onChange={(event) => setNotes(event.target.value)}
        containerClassName="mt-5"
      />

      <Button
        type="submit"
        size="lg"
        fullWidth
        className="mt-4"
        disabled={!photo}
        loading={checkIn.isPending}
      >
        Kirim Absen <Icon name="arrowRight" size={16} />
      </Button>
    </form>
  );
}
