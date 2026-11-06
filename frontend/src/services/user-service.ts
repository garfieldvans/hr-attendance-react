import type { EmployeeInput, PagedResult, Role, User } from '../types';
import { http } from './http';

export interface UserFilters {
  q?: string;
  role?: Role;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const getUsers = async (filters: UserFilters = {}) => {
  const response = await http.get<PagedResult<User>>('/users', { params: filters });
  return response.data;
};

export const getUser = async (id: string) => {
  const response = await http.get<User>(`/users/${id}`);
  return response.data;
};

export const createUser = async (payload: EmployeeInput) => {
  const response = await http.post<User>('/users', payload);
  return response.data;
};

export const updateUser = async (id: string, payload: Partial<EmployeeInput>) => {
  const response = await http.patch<User>(`/users/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id: string) => {
  await http.delete(`/users/${id}`);
};
