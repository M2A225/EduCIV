import { Module } from '@nestjs/common';
import { TeacherSubjectsController } from './teacher-subjects.controller';
import { TeacherSubjectsService } from './teacher-subjects.service';
import { TeacherSubjectsRepository } from './teacher-subjects.repository';

@Module({
  controllers: [TeacherSubjectsController],
  providers: [TeacherSubjectsService, TeacherSubjectsRepository],
  exports: [TeacherSubjectsService],
})
export class TeacherSubjectsModule {}
