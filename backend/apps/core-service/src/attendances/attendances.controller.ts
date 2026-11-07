import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CurrentUser,
  JwtAuthGuard,
  JwtPayload,
  Role,
  Roles,
  RolesGuard,
} from '../../../../libs/common/src';
import { AttendancesService } from './attendances.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { QueryAttendancesDto, QueryPeriodDto } from './dto/query-attendances.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { attendancePhotoUpload } from './photo-storage';

@Controller('attendances')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Post()
  @Roles(Role.EMPLOYEE)
  @UseInterceptors(FileInterceptor('photo', attendancePhotoUpload))
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAttendanceDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.attendancesService.create(user, photo, dto);
  }

  @Patch('me/check-out')
  @Roles(Role.EMPLOYEE)
  checkOut(@CurrentUser() user: JwtPayload) {
    return this.attendancesService.checkOut(user.sub);
  }

  @Patch(':id')
  @Roles(Role.EMPLOYEE)
  @UseInterceptors(FileInterceptor('photo', attendancePhotoUpload))
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAttendanceDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.attendancesService.update(user, id, photo, dto);
  }

  @Get('me')
  findMine(@CurrentUser() user: JwtPayload, @Query() query: QueryPeriodDto) {
    return this.attendancesService.findMine(user.sub, query);
  }

  @Get()
  @Roles(Role.HRD)
  findForMonitoring(@Query() query: QueryAttendancesDto) {
    return this.attendancesService.findForMonitoring(query);
  }
}
