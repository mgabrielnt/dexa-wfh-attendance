import axios, { AxiosError } from 'axios';
import { tokenStorage } from './token-storage';

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export const apiClient = axios.create({ baseURL: `${API_ORIGIN}/api` });

let handleUnauthorized: (() => void) | undefined;

export function onUnauthorized(handler: () => void) {
  handleUnauthorized = handler;
}

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && tokenStorage.get()) handleUnauthorized?.();
    return Promise.reject(error);
  },
);

export function assetUrl(path: string): string {
  return `${API_ORIGIN}${path}`;
}

export function getErrorMessage(error: unknown, fallback = 'Terjadi kesalahan, coba lagi'): string {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (message) return message;
    if (!error.response) return 'Tidak dapat terhubung ke server';
  }
  return fallback;
}
