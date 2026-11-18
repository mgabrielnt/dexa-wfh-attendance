import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Brand } from '@/components/ui/Brand';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { TextField } from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/api-client';
import { HOME_BY_ROLE, useAuth } from './auth-context';

const loginSchema = z.object({
  email: z.string().trim().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { profile, login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  if (profile) return <Navigate to={HOME_BY_ROLE[profile.user.role]} replace />;

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setServerError(null);
    try {
      const session = await login(email, password);
      navigate(HOME_BY_ROLE[session.user.role], { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error, 'Login gagal'));
    }
  });

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-4 py-10">
      <div aria-hidden className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-lime/10" />

      <div className="relative w-full max-w-[400px]">
        <Brand dark />

        <h1 className="mt-20 text-[44px] font-extrabold leading-[1.12] text-white">
          Masuk untuk
          <br />
          absen WFH
        </h1>
        <p className="mt-4 text-sm font-medium text-on-dark">Gunakan akun yang dibuat oleh Admin HRD.</p>

        <form onSubmit={onSubmit} noValidate className="mt-12 flex flex-col gap-6">
          <TextField
            dark
            label="Email"
            type="email"
            autoComplete="username"
            placeholder="nama@perusahaan.co.id"
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            dark
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="text-xs font-semibold text-on-dark hover:text-white"
              >
                {showPassword ? 'Sembunyikan' : 'Lihat'}
              </button>
            }
            {...register('password')}
          />

          {serverError && (
            <p
              role="alert"
              className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-[13px] font-semibold text-danger-light"
            >
              {serverError}
            </p>
          )}

          <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-2">
            Masuk <Icon name="arrowRight" size={16} />
          </Button>
        </form>

        <p className="mt-8 text-xs font-medium leading-5 text-on-dark-faint">
          Karyawan diarahkan ke halaman Absen WFH.
          <br />
          Admin HRD diarahkan ke Dashboard Kehadiran.
        </p>
      </div>
    </main>
  );
}
