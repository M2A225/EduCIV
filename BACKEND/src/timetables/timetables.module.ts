import { Module } from '@nestjs/common';
import { TimetablesController } from './timetables.controller';
import { TimetablesService } from './timetables.service';
import { TimetablesRepository } from './timetables.repository';

@Module({
  controllers: [TimetablesController],
  providers: [TimetablesService, TimetablesRepository],
  exports: [TimetablesService],
})
export class TimetablesModule {}
