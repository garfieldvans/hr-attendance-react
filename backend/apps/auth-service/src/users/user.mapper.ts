import { Role } from '../../../../libs/common/src';
import { User } from './user.entity';

export interface PublicUser {
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

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  employeeCode: user.employeeCode,
  name: user.name,
  email: user.email,
  role: user.role,
  position: user.position,
  department: user.department,
  phone: user.phone,
  joinDate: user.joinDate,
  isActive: user.isActive,
});
