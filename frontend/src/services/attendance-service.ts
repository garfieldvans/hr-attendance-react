import type { Attendance, MonitoredAttendance } from '../types';
import { http } from './http';

export interface PeriodFilters {
  from?: string;
  to?: string;
}

export interface MonitoringFilters extends PeriodFilters {
  q?: string;
  userId?: string;
}

export interface SubmitAttendancePayload {
  photo: File;
  notes?: string;
}

export const getMyAttendances = async (filters: PeriodFilters = {}) => {
  const response = await http.get<Attendance[]>('/attendances/me', { params: filters });
  return response.data;
};

export const getAttendances = async (filters: MonitoringFilters = {}) => {
  const response = await http.get<MonitoredAttendance[]>('/attendances', { params: filters });
  return response.data;
};

export const submitAttendance = async ({ photo, notes }: SubmitAttendancePayload) => {
  const body = new FormData();
  body.append('photo', photo);

  if (notes?.trim()) {
    body.append('notes', notes.trim());
  }

  const response = await http.post<Attendance>('/attendances', body);
  return response.data;
};
