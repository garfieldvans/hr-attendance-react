export type Role = 'HRD' | 'EMPLOYEE';

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

export interface Session {
  accessToken: string;
  user: User;
}
