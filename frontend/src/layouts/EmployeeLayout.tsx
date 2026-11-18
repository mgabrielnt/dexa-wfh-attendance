import { NavLink, Outlet } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Brand } from '@/components/ui/Brand';
import { useAuth } from '@/features/auth/auth-context';
import { cn } from '@/lib/cn';

const TABS = [
  { to: '/employee/attendance', label: 'Absen' },
  { to: '/employee/history', label: 'Riwayat' },
];

const tabClasses = 'rounded-full px-[18px] py-2.5 text-[13px] transition';

export function EmployeeLayout() {
  const { profile, logout } = useAuth();
  const name = profile?.employee?.fullName ?? profile?.user.email ?? '';

  return (
    <div className="mx-auto min-h-screen max-w-[900px] px-4 pb-10 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 py-7">
        <Brand />
        <nav aria-label="Menu karyawan" className="flex gap-1 rounded-full bg-ink p-1">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  tabClasses,
                  isActive ? 'bg-lime font-bold text-ink' : 'font-semibold text-white hover:bg-white/10',
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={logout}
            className={cn(tabClasses, 'font-semibold text-white hover:bg-white/10')}
          >
            Keluar
          </button>
        </nav>
        <Avatar name={name} size="md" className="h-11 w-11" />
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
