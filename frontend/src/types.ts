export type Role = 'HRD' | 'EMPLOYEE';

export type WorkType = 'WFH' | 'WFO';

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

export interface Session {
  accessToken: string;
  user: User;
}
