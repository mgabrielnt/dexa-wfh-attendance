import { Injectable } from '@nestjs/common';
import { AuthPattern, EmployeePattern, EmployeeView, JwtPayload, LoginResult, UserView } from '@app/common';
import { ServiceClient } from '../shared/service-client';
import { LoginDto } from './dto/login.dto';

interface SessionProfile {
  user: Pick<UserView, 'id' | 'email' | 'role' | 'employeeId'>;
  employee: EmployeeView | null;
}

@Injectable()
export class AuthService {
  constructor(private readonly services: ServiceClient) {}

  async login(credentials: LoginDto): Promise<{ accessToken: string } & SessionProfile> {
    const { accessToken, user } = await this.services.auth<LoginResult>(AuthPattern.Login, credentials);
    return { accessToken, ...(await this.buildProfile(user)) };
  }

  profile(user: JwtPayload): Promise<SessionProfile> {
    return this.buildProfile({ id: user.sub, email: user.email, role: user.role, employeeId: user.employeeId });
  }

  private async buildProfile(user: SessionProfile['user']): Promise<SessionProfile> {
    const employee = user.employeeId
      ? await this.services.employee<EmployeeView>(EmployeePattern.FindOne, user.employeeId)
      : null;
    return { user: { id: user.id, email: user.email, role: user.role, employeeId: user.employeeId }, employee };
  }
}
