import { NavLink, Outlet } from 'react-router-dom';
import { Brand } from '@/components/ui/Brand';
import { Icon, IconName } from '@/components/ui/Icon';
import { useAuth } from '@/features/auth/auth-context';
import { cn } from '@/lib/cn';
import { WorkdayBar } from './WorkdayBar';

const NAV_ITEMS: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/admin', label: 'Dashboard', icon: 'grid', end: true },
  { to: '/admin/employees', label: 'Data Karyawan', icon: 'users' },
  { to: '/admin/attendances', label: 'Monitoring Absensi', icon: 'calendar' },
];

const navButton = 'grid h-11 w-11 place-items-center rounded-full transition';

export function AdminLayout() {
  const { profile, logout } = useAuth();

  return (
    <div className="mx-auto min-h-screen max-w-[1440px] px-4 pb-10 sm:px-10">
      <header className="flex items-center gap-6 py-6">
        <Brand />
        <div className="hidden flex-1 lg:flex">
          <WorkdayBar />
        </div>
        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <span className="hidden text-right text-xs font-medium text-muted sm:block">
            Admin HRD
            <br />
            <span className="font-semibold text-ink">{profile?.user.email}</span>
          </span>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-avatar-sage text-sm font-bold">
            HR
          </span>
        </div>
      </header>

      <div className="flex gap-6">
        <nav
          aria-label="Menu admin"
          className="sticky top-6 flex h-fit flex-col gap-1 rounded-full bg-white p-0 shadow-sm"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              aria-label={item.label}
              className={({ isActive }) =>
                cn(navButton, isActive ? 'bg-ink text-white' : 'text-body-light hover:bg-soft')
              }
            >
              <Icon name={item.icon} />
            </NavLink>
          ))}
          <button
            type="button"
            title="Keluar"
            aria-label="Keluar"
            onClick={logout}
            className={cn(navButton, 'text-body-light hover:bg-soft')}
          >
            <Icon name="logout" />
          </button>
        </nav>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
