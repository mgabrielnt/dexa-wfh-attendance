import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateEmployeePayload, EmployeePattern, FindEmployeesQuery, UpdateEmployeePayload } from '@app/common';
import { EmployeeService } from './employee.service';

@Controller()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @MessagePattern(EmployeePattern.Create)
  create(@Payload() payload: CreateEmployeePayload) {
    return this.employeeService.create(payload);
  }

  @MessagePattern(EmployeePattern.Update)
  update(@Payload() payload: UpdateEmployeePayload) {
    return this.employeeService.update(payload);
  }

  @MessagePattern(EmployeePattern.Deactivate)
  deactivate(@Payload() id: number) {
    return this.employeeService.deactivate(id);
  }

  @MessagePattern(EmployeePattern.Purge)
  purge(@Payload() id: number) {
    return this.employeeService.purge(id);
  }

  @MessagePattern(EmployeePattern.FindAll)
  findAll(@Payload() query: FindEmployeesQuery) {
    return this.employeeService.findAll(query);
  }

  @MessagePattern(EmployeePattern.FindOne)
  findOne(@Payload() id: number) {
    return this.employeeService.findOne(id);
  }

  @MessagePattern(EmployeePattern.FindByIds)
  findByIds(@Payload() ids: number[]) {
    return this.employeeService.findByIds(ids);
  }

  @MessagePattern(EmployeePattern.CountActive)
  countActive() {
    return this.employeeService.countActive();
  }
}
