import type { ChangeRequest, ChangeRequestStatus, PagedResult } from '../types';
import { http } from './http';

export interface CreateChangeRequestPayload {
  attendanceId: string;
  reason: string;
}

export interface ReviewChangeRequestPayload {
  status: Extract<ChangeRequestStatus, 'APPROVED' | 'REJECTED'>;
  reviewNote?: string;
}

export interface ChangeRequestFilters {
  status?: ChangeRequestStatus;
  page?: number;
  limit?: number;
}

export const getMyChangeRequests = async () => {
  const response = await http.get<ChangeRequest[]>('/attendance-change-requests/me');
  return response.data;
};

export const createChangeRequest = async ({ attendanceId, reason }: CreateChangeRequestPayload) => {
  const response = await http.post<ChangeRequest>('/attendance-change-requests', {
    attendanceId,
    reason,
  });
  return response.data;
};

export const getChangeRequests = async (filters: ChangeRequestFilters = {}) => {
  const response = await http.get<PagedResult<ChangeRequest>>('/attendance-change-requests', {
    params: filters,
  });
  return response.data;
};

export const reviewChangeRequest = async (
  id: string,
  { status, reviewNote }: ReviewChangeRequestPayload,
) => {
  const response = await http.patch<ChangeRequest>(`/attendance-change-requests/${id}/review`, {
    status,
    ...(reviewNote?.trim() ? { reviewNote: reviewNote.trim() } : {}),
  });
  return response.data;
};
