import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimetablesController } from './timetables.controller';
import { TimetablesService } from './timetables.service';
import { TimetablesRepository } from './timetables.repository';
import { Timetable } from '../entities/timetable.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Timetable])],
  controllers: [TimetablesController],
  providers: [TimetablesService, TimetablesRepository],
  exports: [TimetablesService],
})
export class TimetablesModule {}
