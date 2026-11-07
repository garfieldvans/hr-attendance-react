import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtModuleOptions } from '../../../../libs/common/src';
import { AttendanceChangeRequest } from './attendance-change-request.entity';
import { AttendanceChangeRequestsController } from './attendance-change-requests.controller';
import { AttendanceChangeRequestsService } from './attendance-change-requests.service';
import { Attendance } from './attendance.entity';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, AttendanceChangeRequest]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: jwtModuleOptions,
    }),
  ],
  controllers: [AttendancesController, AttendanceChangeRequestsController],
  providers: [AttendancesService, AttendanceChangeRequestsService],
})
export class AttendancesModule {}
