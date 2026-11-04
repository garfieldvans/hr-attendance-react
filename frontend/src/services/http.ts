import axios from 'axios';
import { clearSession, readSession } from './session';

export const http = axios.create({
  baseURL: '/api',
});

http.interceptors.request.use((config) => {
  const session = readSession();

  if (session) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearSession();

      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  },
);

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message[0];
    }

    if (message) {
      return message;
    }

    if (!error.response) {
      return 'Tidak bisa terhubung ke server, pastikan backend berjalan';
    }
  }

  return 'Terjadi kesalahan, coba lagi';
};
