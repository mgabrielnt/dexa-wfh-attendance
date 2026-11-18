import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import {
  CreateUserPayload,
  JwtPayload,
  LoginPayload,
  LoginResult,
  RpcErrors,
  UpdateUserPayload,
  UserView,
} from '@app/common';
import { User } from './users/user.entity';

const PASSWORD_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginPayload): Promise<LoginResult> {
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: normalizeEmail(email) })
      .getOne();

    const passwordMatches = user && (await bcrypt.compare(password, user.passwordHash));
    if (!user || !passwordMatches) {
      throw RpcErrors.unauthorized('Email atau password salah');
    }
    if (!user.isActive) {
      throw RpcErrors.forbidden('Akun Anda nonaktif. Hubungi Admin HRD.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    };
    return { accessToken: await this.jwtService.signAsync(payload), user: user.toView() };
  }

  async createUser({ email, password, role, employeeId }: CreateUserPayload): Promise<UserView> {
    await this.assertEmailAvailable(email);

    const user = this.users.create({
      email: normalizeEmail(email),
      passwordHash: await bcrypt.hash(password, PASSWORD_SALT_ROUNDS),
      role,
      employeeId,
    });
    return (await this.users.save(user)).toView();
  }

  async updateUser({ employeeId, email, password, isActive }: UpdateUserPayload): Promise<UserView> {
    const user = await this.users.findOneBy({ employeeId });
    if (!user) {
      throw RpcErrors.notFound('Akun karyawan tidak ditemukan');
    }

    if (email && normalizeEmail(email) !== user.email) {
      await this.assertEmailAvailable(email);
      user.email = normalizeEmail(email);
    }
    if (password) {
      user.passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    }
    if (isActive !== undefined) {
      user.isActive = isActive;
    }
    return (await this.users.save(user)).toView();
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    if (await this.users.existsBy({ email: normalizeEmail(email) })) {
      throw RpcErrors.conflict('Email sudah terdaftar');
    }
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
