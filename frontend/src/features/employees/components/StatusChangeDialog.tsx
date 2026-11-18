import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/toast-context';
import { getErrorMessage } from '@/lib/api-client';
import { Employee } from '@/types/api';
import { useChangeEmployeeStatus } from '../employee-queries';

interface StatusChangeDialogProps {
  employee: Pick<Employee, 'id' | 'fullName' | 'status'> | null;
  onClose: () => void;
  onDone?: () => void;
}

export function StatusChangeDialog({ employee, onClose, onDone }: StatusChangeDialogProps) {
  const toast = useToast();
  const changeStatus = useChangeEmployeeStatus();

  if (!employee) return null;
  const deactivating = employee.status === 'ACTIVE';

  async function confirm() {
    if (!employee) return;
    try {
      await changeStatus.mutateAsync({ id: employee.id, status: deactivating ? 'INACTIVE' : 'ACTIVE' });
      toast.success(
        deactivating ? `${employee.fullName} dinonaktifkan` : `${employee.fullName} diaktifkan kembali`,
      );
      onClose();
      onDone?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <Modal
      open
      title={deactivating ? 'Nonaktifkan karyawan?' : 'Aktifkan kembali?'}
      onClose={onClose}
      className="max-w-[440px]"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant={deactivating ? 'danger' : 'primary'}
            loading={changeStatus.isPending}
            onClick={confirm}
          >
            {deactivating ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
        </div>
      }
    >
      <p className="text-sm leading-6 text-body">
        {deactivating ? (
          <>
            <strong>{employee.fullName}</strong> tidak akan bisa login lagi. Data karyawan dan riwayat
            absensinya tetap tersimpan.
          </>
        ) : (
          <>
            <strong>{employee.fullName}</strong> akan bisa login dan melakukan absensi kembali.
          </>
        )}
      </p>
    </Modal>
  );
}
