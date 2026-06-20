import { Module } from '@nestjs/common';
import { SchoolYearsController } from './school-years.controller';
import { SchoolYearsService } from './school-years.service';
import { SchoolYearsRepository } from './school-years.repository';
import { PrismaService } from '../core/prisma.service';
import { PeriodsModule } from '../periods/periods.module';

@Module({
  imports: [PeriodsModule],
  controllers: [SchoolYearsController],
  providers: [SchoolYearsService, SchoolYearsRepository, PrismaService],
  exports: [SchoolYearsService],
})
export class SchoolYearsModule {}
