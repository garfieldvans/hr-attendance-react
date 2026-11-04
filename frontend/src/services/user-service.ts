import type { Role, User } from '../types';
import { http } from './http';

export interface UserFilters {
  q?: string;
  role?: Role;
  isActive?: boolean;
}

export const getUsers = async (filters: UserFilters = {}) => {
  const response = await http.get<User[]>('/users', { params: filters });
  return response.data;
};
