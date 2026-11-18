import { createContext, useContext } from 'react';
import { Role, SessionProfile } from '@/types/api';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

export interface AuthState {
  status: AuthStatus;
  profile: SessionProfile | null;
  login: (email: string, password: string) => Promise<SessionProfile>;
  logout: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

export const HOME_BY_ROLE: Record<Role, string> = {
  ADMIN: '/admin',
  EMPLOYEE: '/employee/attendance',
};
