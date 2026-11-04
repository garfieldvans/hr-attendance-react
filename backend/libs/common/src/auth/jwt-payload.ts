import { Role } from '../role.enum';

export interface JwtPayload {
  sub: string;
  employeeCode: string;
  name: string;
  role: Role;
}
