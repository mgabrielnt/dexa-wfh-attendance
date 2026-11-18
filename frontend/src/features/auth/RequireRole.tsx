import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { Role } from '@/types/api';
import { HOME_BY_ROLE, useAuth } from './auth-context';

export function RequireRole({ role }: { role: Role }) {
  const { status, profile } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageSpinner />;
  if (!profile) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (profile.user.role !== role) return <Navigate to={HOME_BY_ROLE[profile.user.role]} replace />;

  return <Outlet />;
}

export function HomeRedirect() {
  const { status, profile } = useAuth();

  if (status === 'loading') return <FullPageSpinner />;
  return <Navigate to={profile ? HOME_BY_ROLE[profile.user.role] : '/login'} replace />;
}
