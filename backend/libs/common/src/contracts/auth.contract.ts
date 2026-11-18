import { Role } from '../enums';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
  employeeId: number | null;
}

export interface UserView {
  id: number;
  email: string;
  role: Role;
  employeeId: number | null;
  isActive: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  user: UserView;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  role: Role;
  employeeId: number | null;
}

export interface UpdateUserPayload {
  employeeId: number;
  email?: string;
  password?: string;
  isActive?: boolean;
}
