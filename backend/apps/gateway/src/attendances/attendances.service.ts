import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { unlink } from 'fs/promises';
import {
  AttendancePattern,
  AttendanceView,
  currentMonth,
  EmployeePattern,
  EmployeeView,
  JwtPayload,
  MonthlyStats,
  monthRange,
  Paginated,
  Role,
  toLocalDate,
} from '@app/common';
import { ServiceClient } from '../shared/service-client';
import { FindAttendancesQueryDto, MyAttendancesQueryDto, StatsQueryDto } from './dto/attendance.dto';
import { toPhotoPath } from './photo-storage.config';

type EmployeeSummary = Pick<EmployeeView, 'id' | 'fullName' | 'employeeCode' | 'position' | 'department'>;

interface AttendanceResponse extends Omit<AttendanceView, 'photoPath'> {
  photoUrl: string;
  employee?: EmployeeSummary | null;
}

interface DailySummary {
  date: string;
  activeEmployees: number;
  checkedIn: number;
  notCheckedIn: number;
}

@Injectable()
export class AttendancesService {
  private readonly logger = new Logger(AttendancesService.name);

  constructor(private readonly services: ServiceClient) {}

  async checkIn(user: JwtPayload, photo: Express.Multer.File | undefined, notes?: string): Promise<AttendanceResponse> {
    if (!photo) {
      throw new BadRequestException('Foto bukti WFH wajib diunggah');
    }
    const employeeId = requireEmployeeId(user);

    try {
      const attendance = await this.services.attendance<AttendanceView>(AttendancePattern.CheckIn, {
        employeeId,
        photoPath: toPhotoPath(photo.filename),
        notes,
      });
      return toResponse(attendance);
    } catch (error) {
      await this.discardFile(photo.path);
      throw error;
    }
  }

  async today(user: JwtPayload): Promise<{ serverTime: Date; attendance: AttendanceResponse | null }> {
    const attendance = await this.services.attendance<AttendanceView | null>(
      AttendancePattern.FindToday,
      requireEmployeeId(user),
    );
    return { serverTime: new Date(), attendance: attendance ? toResponse(attendance) : null };
  }

  async mine(user: JwtPayload, { month = currentMonth(), page, limit }: MyAttendancesQueryDto) {
    const result = await this.services.attendance<Paginated<AttendanceView>>(AttendancePattern.FindAll, {
      employeeId: requireEmployeeId(user),
      ...monthRange(month),
      page,
      limit,
    });
    return { ...result, data: result.data.map((attendance) => toResponse(attendance)) };
  }

  monthlyStats(user: JwtPayload, { month = currentMonth(), employeeId }: StatsQueryDto): Promise<MonthlyStats> {
    const targetId = user.role === Role.Employee ? requireEmployeeId(user) : employeeId;
    if (!targetId) {
      throw new BadRequestException('employeeId wajib diisi');
    }
    return this.services.attendance(AttendancePattern.MonthlyStats, { employeeId: targetId, month });
  }

  async summary(date = toLocalDate(new Date())): Promise<DailySummary> {
    const [activeEmployees, checkedIn] = await Promise.all([
      this.services.employee<number>(EmployeePattern.CountActive),
      this.services.attendance<number>(AttendancePattern.CountByDate, date),
    ]);
    return { date, activeEmployees, checkedIn, notCheckedIn: Math.max(0, activeEmployees - checkedIn) };
  }

  async findAll(query: FindAttendancesQueryDto): Promise<Paginated<AttendanceResponse>> {
    const page = await this.services.attendance<Paginated<AttendanceView>>(AttendancePattern.FindAll, query);
    const employeeIds = [...new Set(page.data.map((attendance) => attendance.employeeId))];
    const employees = await this.services.employee<EmployeeView[]>(EmployeePattern.FindByIds, employeeIds);
    const employeesById = new Map(employees.map((employee) => [employee.id, summarize(employee)]));

    return {
      ...page,
      data: page.data.map((attendance) => toResponse(attendance, employeesById.get(attendance.employeeId) ?? null)),
    };
  }

  private async discardFile(path: string): Promise<void> {
    try {
      await unlink(path);
    } catch (error) {
      this.logger.warn(`Could not remove rejected upload ${path}: ${(error as Error).message}`);
    }
  }
}

function requireEmployeeId(user: JwtPayload): number {
  if (!user.employeeId) {
    throw new ForbiddenException('Akun ini tidak terhubung dengan data karyawan');
  }
  return user.employeeId;
}

function toResponse(
  { photoPath, ...attendance }: AttendanceView,
  employee?: EmployeeSummary | null,
): AttendanceResponse {
  return { ...attendance, photoUrl: `/uploads/${photoPath}`, ...(employee !== undefined && { employee }) };
}

function summarize({ id, fullName, employeeCode, position, department }: EmployeeView): EmployeeSummary {
  return { id, fullName, employeeCode, position, department };
}
