import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthPattern, CreateUserPayload, LoginPayload, UpdateUserPayload } from '@app/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AuthPattern.Login)
  login(@Payload() payload: LoginPayload) {
    return this.authService.login(payload);
  }

  @MessagePattern(AuthPattern.CreateUser)
  createUser(@Payload() payload: CreateUserPayload) {
    return this.authService.createUser(payload);
  }

  @MessagePattern(AuthPattern.UpdateUser)
  updateUser(@Payload() payload: UpdateUserPayload) {
    return this.authService.updateUser(payload);
  }
}
