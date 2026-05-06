import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceSessionRepository } from './attendance-session.repository';
import { Attendance } from '../entities/attendance.entity';
import { AttendanceSession } from '../entities/attendance_session.entity';
import { TeacherSubject } from '../entities/teacher_subject.entity';
import { Timetable } from '../entities/timetable.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, AttendanceSession, TeacherSubject, Timetable])],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceRepository, AttendanceSessionRepository],
  exports: [AttendanceService],
})
export class AttendanceModule {}

