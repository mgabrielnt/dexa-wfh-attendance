import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Spinner } from '@/components/ui/Spinner';
import { SelectField, TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/toast-context';
import { AdminPageHeader } from '@/layouts/AdminPageHeader';
import { getErrorMessage } from '@/lib/api-client';
import { Employee } from '@/types/api';
import { StatusChangeDialog } from './components/StatusChangeDialog';
import {
  createEmployeeSchema,
  DEPARTMENTS,
  editEmployeeSchema,
  EmployeeFormValues,
  emptyEmployeeForm,
} from './employee-form-schema';
import { useEmployee, useSaveEmployee } from './employee-queries';
import { EmployeePayload } from './employees-api';

const FIELD_BY_CONFLICT: Record<string, keyof EmployeeFormValues> = {
  'NIK sudah terdaftar': 'employeeCode',
  'Email sudah terdaftar': 'email',
};

function toFormValues(employee: Employee): EmployeeFormValues {
  return {
    employeeCode: employee.employeeCode,
    fullName: employee.fullName,
    email: employee.email,
    phone: employee.phone ?? '',
    department: employee.department,
    position: employee.position,
    joinDate: employee.joinDate,
    status: employee.status,
    password: '',
  };
}

function toPayload({ phone, password, ...values }: EmployeeFormValues): EmployeePayload {
  return { ...values, ...(phone && { phone }), ...(password && { password }) };
}

const EDIT_NOTES = [
  'Form terisi otomatis dengan data lama',
  'Password opsional — isi hanya untuk reset',
  'NIK & email tetap divalidasi unik',
  'Perubahan email ikut memperbarui akun login',
];

const CREATE_NOTES = [
  'Akun login dibuat otomatis dengan role Karyawan',
  'Karyawan login memakai email dan password awal',
  'Sampaikan password awal ke karyawan secara pribadi',
  'NIK dan email tidak boleh sama dengan karyawan lain',
];

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 flex flex-col gap-3 text-[13px] font-medium text-on-dark-bright">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-3">
          <span className="h-2 w-2 shrink-0 rounded-full bg-lime" /> {item}
        </li>
      ))}
    </ul>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <h3 className="label-caps col-span-full mt-2 border-b border-line pb-2">{children}</h3>;
}

export function EmployeeFormPage() {
  const params = useParams();
  const employeeId = params.id ? Number(params.id) : undefined;
  const isEdit = employeeId !== undefined;

  const navigate = useNavigate();
  const toast = useToast();
  const { data: employee, isLoading } = useEmployee(employeeId);
  const save = useSaveEmployee(employeeId);
  const [showPassword, setShowPassword] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(isEdit ? editEmployeeSchema : createEmployeeSchema),
    defaultValues: emptyEmployeeForm,
    values: employee ? toFormValues(employee) : undefined,
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync(toPayload(values));
      toast.success('Data karyawan berhasil disimpan');
      navigate('/admin/employees');
    } catch (error) {
      const message = getErrorMessage(error, 'Data karyawan gagal disimpan');
      const field = FIELD_BY_CONFLICT[message];
      if (field) setError(field, { message });
      else toast.error(message);
    }
  });

  if (isEdit && isLoading) {
    return (
      <div className="grid h-96 place-items-center text-muted">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader title="KARYAWAN" />

      <nav aria-label="Breadcrumb" className="mb-4 text-[13px] font-medium text-muted">
        <Link to="/admin/employees" className="hover:text-ink">
          Data Karyawan
        </Link>
        <span className="mx-3">›</span>
        <span className="font-bold text-ink">{isEdit ? 'Edit Karyawan' : 'Tambah Karyawan'}</span>
      </nav>

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_400px]">
        <form onSubmit={onSubmit} noValidate className="card p-8">
          <h2 className="text-2xl font-bold">{isEdit ? 'Edit Karyawan' : 'Tambah Karyawan'}</h2>
          <p className="mt-1 text-xs font-medium text-muted">
            Data master karyawan sekaligus akun login-nya · <span className="text-danger-ink">*</span> wajib
            diisi
          </p>

          <div className="mt-6 grid gap-x-5 gap-y-5 md:grid-cols-2">
            <SectionTitle>Data pribadi</SectionTitle>
            <TextField
              label="NIK"
              required
              error={errors.employeeCode?.message}
              {...register('employeeCode')}
            />
            <TextField
              label="Nama lengkap"
              required
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <TextField
              label="Email"
              type="email"
              required
              error={errors.email?.message}
              {...register('email')}
            />
            <TextField
              label="No. HP"
              type="tel"
              placeholder="0812-3456-7890"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <SectionTitle>Pekerjaan</SectionTitle>
            <SelectField
              label="Departemen"
              required
              error={errors.department?.message}
              {...register('department')}
            >
              <option value="">Pilih departemen</option>
              {DEPARTMENTS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </SelectField>
            <TextField label="Jabatan" required error={errors.position?.message} {...register('position')} />
            <TextField
              label="Tanggal bergabung"
              type="date"
              required
              error={errors.joinDate?.message}
              {...register('joinDate')}
            />
            {isEdit ? (
              <SelectField label="Status" {...register('status')}>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Nonaktif</option>
              </SelectField>
            ) : (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold">Status</span>
                <p className="flex h-12 items-center rounded-2xl bg-canvas px-4 text-sm font-medium text-muted">
                  Aktif (karyawan baru)
                </p>
              </div>
            )}

            <SectionTitle>Akun login</SectionTitle>
            <TextField
              label={isEdit ? 'Password baru' : 'Password awal'}
              required={!isEdit}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder={isEdit ? 'Kosongkan jika tidak diubah' : '••••••••'}
              error={errors.password?.message}
              hint={
                isEdit
                  ? 'Password lama tidak ditampilkan karena tersimpan terenkripsi. Isi hanya untuk mereset.'
                  : 'Min. 8 karakter. Karyawan login dengan email di atas.'
              }
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="text-xs font-semibold text-muted hover:text-ink"
                >
                  {showPassword ? 'Sembunyikan' : 'Lihat'}
                </button>
              }
              {...register('password')}
            />
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold">Role</span>
              <Chip tone="success" size="md" className="h-12 w-fit rounded-2xl">
                Karyawan (otomatis)
              </Chip>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/admin/employees')}>
              Batal
            </Button>
            <Button type="submit" loading={save.isPending} className="min-w-[120px]">
              Simpan
            </Button>
          </div>
        </form>

        <aside className="panel-dark p-7">
          {isEdit && employee ? (
            <>
              <p className="text-[13px] font-medium text-on-dark">Mode edit</p>
              <div className="mt-4 flex items-center gap-3 rounded-[18px] bg-ink-soft p-4">
                <Avatar name={employee.fullName} />
                <div>
                  <p className="text-[15px] font-bold">{employee.fullName}</p>
                  <p className="text-[11px] font-medium text-muted">
                    NIK {employee.employeeCode} · {employee.position}
                  </p>
                </div>
              </div>
              <BulletList items={EDIT_NOTES} />

              <div className="mt-8 rounded-[20px] border border-danger-night-border bg-ink-soft p-5">
                <p className="text-[15px] font-bold">
                  {employee.status === 'ACTIVE' ? 'Nonaktifkan karyawan' : 'Aktifkan kembali'}
                </p>
                <p className="mt-2 text-xs font-medium leading-5 text-on-dark">
                  Soft delete: status jadi Nonaktif, akun tidak bisa login. Riwayat absensi tetap tersimpan.
                </p>
                <button
                  type="button"
                  onClick={() => setStatusDialogOpen(true)}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-danger bg-danger-night text-[13px] font-bold text-danger-bright hover:bg-danger-night-hover"
                >
                  <Icon name={employee.status === 'ACTIVE' ? 'ban' : 'refresh'} size={15} />
                  {employee.status === 'ACTIVE' ? 'Nonaktifkan Karyawan' : 'Aktifkan Karyawan'}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[13px] font-medium text-on-dark">Panduan</p>
              <h3 className="mt-1 text-2xl font-bold">Karyawan baru</h3>
              <BulletList items={CREATE_NOTES} />
            </>
          )}
        </aside>
      </div>

      {statusDialogOpen && employee && (
        <StatusChangeDialog
          employee={employee}
          onClose={() => setStatusDialogOpen(false)}
          onDone={() => navigate('/admin/employees')}
        />
      )}
    </>
  );
}
