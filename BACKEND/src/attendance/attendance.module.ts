import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceSessionRepository } from './attendance-session.repository';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceRepository, AttendanceSessionRepository],
  exports: [AttendanceService],
})
export class AttendanceModule {}

