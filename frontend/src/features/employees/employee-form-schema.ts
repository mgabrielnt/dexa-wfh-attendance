import { z } from 'zod';

export const DEPARTMENTS = ['HR', 'IT', 'Finance', 'Marketing', 'Operasional', 'Sales'] as const;

const baseSchema = z.object({
  employeeCode: z
    .string()
    .trim()
    .min(1, 'NIK wajib diisi')
    .max(20, 'NIK maksimal 20 karakter')
    .regex(/^[A-Za-z0-9-]+$/, 'NIK hanya boleh huruf, angka, atau tanda hubung'),
  fullName: z.string().trim().min(1, 'Nama lengkap wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  email: z.string().trim().email('Format email tidak valid'),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || /^[0-9+\-\s]{8,20}$/.test(value), 'Nomor HP tidak valid'),
  department: z.string().min(1, 'Departemen wajib dipilih'),
  position: z.string().trim().min(1, 'Jabatan wajib diisi').max(50),
  joinDate: z.string().min(1, 'Tanggal bergabung wajib diisi'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export const createEmployeeSchema = baseSchema.extend({
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

export const editEmployeeSchema = baseSchema.extend({
  password: z.string().refine((value) => value === '' || value.length >= 8, 'Password minimal 8 karakter'),
});

export type EmployeeFormValues = z.infer<typeof createEmployeeSchema>;

export const emptyEmployeeForm: EmployeeFormValues = {
  employeeCode: '',
  fullName: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  joinDate: '',
  status: 'ACTIVE',
  password: '',
};
