import { Body, Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtPayload, Role } from '@app/common';
import { CurrentUser, Roles } from '../auth/decorators';
import { AttendancesService } from './attendances.service';
import {
  CheckInDto,
  FindAttendancesQueryDto,
  MyAttendancesQueryDto,
  StatsQueryDto,
  SummaryQueryDto,
} from './dto/attendance.dto';
import { PHOTO_FIELD } from './photo-storage.config';

@ApiTags('Attendances')
@ApiBearerAuth()
@Controller('attendances')
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Post()
  @Roles(Role.Employee)
  @UseInterceptors(FileInterceptor(PHOTO_FIELD))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CheckInDto })
  checkIn(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() photo: Express.Multer.File | undefined,
    @Body() dto: CheckInDto,
  ) {
    return this.attendancesService.checkIn(user, photo, dto.notes);
  }

  @Get('today')
  @Roles(Role.Employee)
  today(@CurrentUser() user: JwtPayload) {
    return this.attendancesService.today(user);
  }

  @Get('me')
  @Roles(Role.Employee)
  mine(@CurrentUser() user: JwtPayload, @Query() query: MyAttendancesQueryDto) {
    return this.attendancesService.mine(user, query);
  }

  @Get('stats')
  stats(@CurrentUser() user: JwtPayload, @Query() query: StatsQueryDto) {
    return this.attendancesService.monthlyStats(user, query);
  }

  @Get('summary')
  @Roles(Role.Admin)
  summary(@Query() query: SummaryQueryDto) {
    return this.attendancesService.summary(query.date);
  }

  @Get()
  @Roles(Role.Admin)
  findAll(@Query() query: FindAttendancesQueryDto) {
    return this.attendancesService.findAll(query);
  }
}
