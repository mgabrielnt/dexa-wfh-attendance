import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CreateEmployeePayload,
  EmployeeStatus,
  EmployeeView,
  FindEmployeesQuery,
  Paginated,
  resolvePage,
  RpcErrors,
  toPaginated,
  UpdateEmployeePayload,
} from '@app/common';
import { Employee } from './employee.entity';

@Injectable()
export class EmployeeService {
  constructor(@InjectRepository(Employee) private readonly employees: Repository<Employee>) {}

  async create(payload: CreateEmployeePayload): Promise<EmployeeView> {
    await this.assertUnique(payload.employeeCode, payload.email);

    const employee = this.employees.create({
      ...payload,
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone || null,
    });
    return (await this.employees.save(employee)).toView();
  }

  async update({ id, ...changes }: UpdateEmployeePayload): Promise<EmployeeView> {
    const employee = await this.getOrFail(id);

    const codeChanged = changes.employeeCode && changes.employeeCode !== employee.employeeCode;
    const emailChanged = changes.email && changes.email.trim().toLowerCase() !== employee.email;
    await this.assertUnique(codeChanged ? changes.employeeCode : undefined, emailChanged ? changes.email : undefined);

    Object.assign(employee, {
      ...changes,
      ...(changes.email && { email: changes.email.trim().toLowerCase() }),
      ...(changes.phone !== undefined && { phone: changes.phone || null }),
    });
    return (await this.employees.save(employee)).toView();
  }

  async deactivate(id: number): Promise<EmployeeView> {
    const employee = await this.getOrFail(id);
    employee.status = EmployeeStatus.Inactive;
    return (await this.employees.save(employee)).toView();
  }

  async purge(id: number): Promise<boolean> {
    const result = await this.employees.delete({ id });
    return Boolean(result.affected);
  }

  async findAll(query: FindEmployeesQuery): Promise<Paginated<EmployeeView>> {
    const { page, limit, skip } = resolvePage(query);
    const builder = this.employees.createQueryBuilder('employee').orderBy('employee.fullName', 'ASC');

    if (query.search) {
      builder.andWhere(
        '(employee.fullName LIKE :search OR employee.employeeCode LIKE :search OR employee.email LIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }
    if (query.status) {
      builder.andWhere('employee.status = :status', { status: query.status });
    }
    if (query.department) {
      builder.andWhere('employee.department = :department', { department: query.department });
    }

    const [rows, total] = await builder.skip(skip).take(limit).getManyAndCount();
    return toPaginated(
      rows.map((row) => row.toView()),
      total,
      page,
      limit,
    );
  }

  async findOne(id: number): Promise<EmployeeView> {
    return (await this.getOrFail(id)).toView();
  }

  async findByIds(ids: number[]): Promise<EmployeeView[]> {
    if (ids.length === 0) return [];
    const rows = await this.employees.findBy({ id: In(ids) });
    return rows.map((row) => row.toView());
  }

  countActive(): Promise<number> {
    return this.employees.countBy({ status: EmployeeStatus.Active });
  }

  private async getOrFail(id: number): Promise<Employee> {
    const employee = await this.employees.findOneBy({ id });
    if (!employee) {
      throw RpcErrors.notFound('Karyawan tidak ditemukan');
    }
    return employee;
  }

  private async assertUnique(employeeCode?: string, email?: string): Promise<void> {
    if (employeeCode && (await this.employees.existsBy({ employeeCode }))) {
      throw RpcErrors.conflict('NIK sudah terdaftar');
    }
    if (email && (await this.employees.existsBy({ email: email.trim().toLowerCase() }))) {
      throw RpcErrors.conflict('Email sudah terdaftar');
    }
  }
}
