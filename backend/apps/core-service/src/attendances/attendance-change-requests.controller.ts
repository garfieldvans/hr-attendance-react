import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  JwtAuthGuard,
  JwtPayload,
  Role,
  Roles,
  RolesGuard,
} from '../../../../libs/common/src';
import { AttendanceChangeRequestsService } from './attendance-change-requests.service';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { QueryChangeRequestsDto } from './dto/query-change-requests.dto';
import { ReviewChangeRequestDto } from './dto/review-change-request.dto';

@Controller('attendance-change-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceChangeRequestsController {
  constructor(private readonly changeRequests: AttendanceChangeRequestsService) {}

  @Post()
  @Roles(Role.EMPLOYEE)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateChangeRequestDto) {
    return this.changeRequests.create(user, dto);
  }

  @Get('me')
  @Roles(Role.EMPLOYEE)
  findMine(@CurrentUser() user: JwtPayload) {
    return this.changeRequests.findMine(user.sub);
  }

  @Get()
  @Roles(Role.HRD)
  findAll(@Query() query: QueryChangeRequestsDto) {
    return this.changeRequests.findForHrd(query);
  }

  @Patch(':id/review')
  @Roles(Role.HRD)
  review(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ReviewChangeRequestDto,
  ) {
    return this.changeRequests.review(user, id, dto);
  }
}
