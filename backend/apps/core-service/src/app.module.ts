import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmOptions } from '../../../libs/common/src';
import { AttendancesModule } from './attendances/attendances.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmOptions,
    }),
    AttendancesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
