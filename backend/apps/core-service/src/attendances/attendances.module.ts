import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtModuleOptions } from '../../../../libs/common/src';
import { Attendance } from './attendance.entity';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';
import { Employee } from './employee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Employee]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: jwtModuleOptions,
    }),
  ],
  controllers: [AttendancesController],
  providers: [AttendancesService],
})
export class AttendancesModule {}
