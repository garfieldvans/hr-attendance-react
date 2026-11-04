import type { Session, User } from '../types';
import { http } from './http';

export const login = async (email: string, password: string) => {
  const response = await http.post<Session>('/auth/login', { email, password });
  return response.data;
};

export const getProfile = async () => {
  const response = await http.get<User>('/auth/profile');
  return response.data;
};
