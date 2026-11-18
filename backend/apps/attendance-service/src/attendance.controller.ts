import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AttendancePattern, CheckInPayload, FindAttendancesQuery, MonthlyStatsQuery } from '@app/common';
import { AttendanceService } from './attendance.service';

@Controller()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @MessagePattern(AttendancePattern.CheckIn)
  checkIn(@Payload() payload: CheckInPayload) {
    return this.attendanceService.checkIn(payload);
  }

  @MessagePattern(AttendancePattern.FindToday)
  findToday(@Payload() employeeId: number) {
    return this.attendanceService.findToday(employeeId);
  }

  @MessagePattern(AttendancePattern.FindAll)
  findAll(@Payload() query: FindAttendancesQuery) {
    return this.attendanceService.findAll(query);
  }

  @MessagePattern(AttendancePattern.CountByDate)
  countByDate(@Payload() date: string) {
    return this.attendanceService.countByDate(date);
  }

  @MessagePattern(AttendancePattern.MonthlyStats)
  monthlyStats(@Payload() query: MonthlyStatsQuery) {
    return this.attendanceService.monthlyStats(query);
  }
}
