export type Role = 'HRD' | 'EMPLOYEE';

export type WorkType = 'WFH';

export interface User {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  role: Role;
  position: string | null;
  department: string | null;
  phone: string | null;
  joinDate: string | null;
  isActive: boolean;
}

export interface EmployeeInput {
  employeeCode: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  position?: string;
  department?: string;
  phone?: string;
  joinDate?: string;
  password?: string;
}

export interface Attendance {
  id: string;
  attendanceDate: string;
  checkInAt: string;
  workType: WorkType;
  notes: string | null;
  photoUrl: string;
}

export interface MonitoredAttendance extends Attendance {
  employee: {
    id: string;
    employeeCode: string;
    name: string;
    position: string | null;
    department: string | null;
  } | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PagedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface Session {
  accessToken: string;
  user: User;
}
