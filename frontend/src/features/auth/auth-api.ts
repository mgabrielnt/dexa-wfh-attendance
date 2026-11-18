import { apiClient } from '@/lib/api-client';
import { LoginResponse, SessionProfile } from '@/types/api';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>('/auth/login', { email, password }).then((response) => response.data),

  profile: () => apiClient.get<SessionProfile>('/auth/me').then((response) => response.data),
};
