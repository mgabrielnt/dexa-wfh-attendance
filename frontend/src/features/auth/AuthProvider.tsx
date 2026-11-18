import { useQueryClient } from '@tanstack/react-query';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { onUnauthorized } from '@/lib/api-client';
import { tokenStorage } from '@/lib/token-storage';
import { SessionProfile } from '@/types/api';
import { authApi } from './auth-api';
import { AuthContext, AuthState, AuthStatus } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<SessionProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (tokenStorage.get() ? 'loading' : 'anonymous'));

  const logout = useCallback(() => {
    tokenStorage.clear();
    queryClient.clear();
    setProfile(null);
    setStatus('anonymous');
  }, [queryClient]);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, ...session } = await authApi.login(email, password);
    tokenStorage.set(accessToken);
    setProfile(session);
    setStatus('authenticated');
    return session;
  }, []);

  useEffect(() => onUnauthorized(logout), [logout]);

  useEffect(() => {
    if (status !== 'loading') return;
    authApi
      .profile()
      .then((session) => {
        setProfile(session);
        setStatus('authenticated');
      })
      .catch(logout);
  }, [status, logout]);

  const value = useMemo<AuthState>(
    () => ({ status, profile, login, logout }),
    [status, profile, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
