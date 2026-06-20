import { Module } from '@nestjs/common';
import { SchoolGroupsController } from './school-groups.controller';
import { SchoolGroupsService } from './school-groups.service';
import { SchoolGroupsRepository } from './school-groups.repository';

@Module({
  controllers: [SchoolGroupsController],
  providers: [SchoolGroupsService, SchoolGroupsRepository],
  exports: [SchoolGroupsService],
})
export class SchoolGroupsModule {}
