import { Injectable } from '@nestjs/common';
import {
  AttendancePattern,
  AttendanceView,
  AuthPattern,
  EmployeePattern,
  EmployeeStatus,
  EmployeeView,
  Paginated,
  Role,
  toLocalDate,
} from '@app/common';
import { ServiceClient } from '../shared/service-client';
import { CreateEmployeeDto, FindEmployeesQueryDto, UpdateEmployeeDto } from './dto/employee.dto';

interface EmployeeListItem extends EmployeeView {
  todayCheckInAt: Date | null;
}

@Injectable()
export class EmployeesService {
  constructor(private readonly services: ServiceClient) {}

  async findAll(query: FindEmployeesQueryDto): Promise<Paginated<EmployeeListItem>> {
    const page = await this.services.employee<Paginated<EmployeeView>>(EmployeePattern.FindAll, query);
    const checkIns = await this.todayCheckIns(page.data.map((employee) => employee.id));

    return {
      ...page,
      data: page.data.map((employee) => ({ ...employee, todayCheckInAt: checkIns.get(employee.id) ?? null })),
    };
  }

  findOne(id: number): Promise<EmployeeView> {
    return this.services.employee(EmployeePattern.FindOne, id);
  }

  async create({ password, ...data }: CreateEmployeeDto): Promise<EmployeeView> {
    const employee = await this.services.employee<EmployeeView>(EmployeePattern.Create, data);

    try {
      await this.services.auth(AuthPattern.CreateUser, {
        email: employee.email,
        password,
        role: Role.Employee,
        employeeId: employee.id,
      });
    } catch (error) {
      await this.services.employee(EmployeePattern.Purge, employee.id);
      throw error;
    }
    return employee;
  }

  async update(id: number, { password, ...changes }: UpdateEmployeeDto): Promise<EmployeeView> {
    const employee = await this.services.employee<EmployeeView>(EmployeePattern.Update, { id, ...changes });

    const accountChanged = changes.email !== undefined || password !== undefined || changes.status !== undefined;
    if (accountChanged) {
      await this.services.auth(AuthPattern.UpdateUser, {
        employeeId: id,
        email: changes.email,
        password,
        isActive: changes.status === undefined ? undefined : changes.status === EmployeeStatus.Active,
      });
    }
    return employee;
  }

  async deactivate(id: number): Promise<EmployeeView> {
    const employee = await this.services.employee<EmployeeView>(EmployeePattern.Deactivate, id);
    await this.services.auth(AuthPattern.UpdateUser, { employeeId: id, isActive: false });
    return employee;
  }

  private async todayCheckIns(employeeIds: number[]): Promise<Map<number, Date>> {
    if (employeeIds.length === 0) return new Map();

    const today = toLocalDate(new Date());
    const { data } = await this.services.attendance<Paginated<AttendanceView>>(AttendancePattern.FindAll, {
      employeeIds,
      from: today,
      to: today,
      limit: employeeIds.length,
    });
    return new Map(data.map((attendance) => [attendance.employeeId, attendance.checkInAt]));
  }
}
