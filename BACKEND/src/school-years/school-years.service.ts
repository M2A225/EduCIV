import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateSchoolYearDto,
  UpdateSchoolYearDto,
} from './dto/create-school-year.dto';
import { SchoolYearsRepository } from './school-years.repository';
import { PeriodsService } from '../periods/periods.service';
import { PrismaService } from '../core/prisma.service';
import { PeriodType } from '@prisma/client';

@Injectable()
export class SchoolYearsService {
  constructor(
    private readonly schoolYearsRepo: SchoolYearsRepository,
    private readonly periodsService: PeriodsService,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateSchoolYearDto) {
    const schoolId = this.schoolYearsRepo.currentSchoolId;
    if (!schoolId) throw new BadRequestException("Identifiant d'école requis");

    return this.prisma.$transaction(async (tx) => {
      const schoolYear = await tx.schoolYear.create({
        data: {
          year_range: dto.year_range,
          school_id: schoolId,
        },
      });

      const school = await tx.school.findUnique({
        where: { id: schoolId },
      });
      const schoolType = school?.school_type || 'SECONDAIRE';

      const periods = this.generatePeriods(schoolType, schoolYear.id);
      await tx.academicPeriod.createMany({
        data: periods.map((p) => ({
          name: p.name,
          period_type: p.period_type,
          start_date: new Date(p.start_date),
          end_date: new Date(p.end_date),
          school_year_id: schoolYear.id,
          school_id: schoolYear.school_id,
        })),
      });

      return tx.schoolYear.findUnique({
        where: { id: schoolYear.id },
        include: { periods: { orderBy: { start_date: 'asc' } } },
      });
    });
  }

  async list(page = 1, pageSize = 20) {
    return this.schoolYearsRepo.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { id: 'desc' },
      include: { periods: { orderBy: { start_date: 'asc' } } },
    });
  }

  async getById(id: number) {
    const schoolYear = await this.schoolYearsRepo.findOne({
      where: { id },
      include: { periods: { orderBy: { start_date: 'asc' } } },
    });
    if (!schoolYear) throw new NotFoundException('Année scolaire introuvable');
    return schoolYear;
  }

  async update(id: number, dto: UpdateSchoolYearDto) {
    const schoolYear = await this.schoolYearsRepo.findOne({ where: { id } });
    if (!schoolYear) throw new NotFoundException('Année scolaire introuvable');
    return this.schoolYearsRepo.update(id, dto);
  }

  async remove(id: number) {
    const schoolYear = await this.schoolYearsRepo.findOne({ where: { id } });
    if (!schoolYear) throw new NotFoundException('Année scolaire introuvable');
    return this.schoolYearsRepo.delete(id);
  }

  private generatePeriods(schoolType: string, schoolYearId: number) {
    const currentYear = new Date().getFullYear();

    if (schoolType === 'PRIMAIRE') {
      return [
        {
          name: 'Composition 1',
          period_type: 'COMPOSITION_1' as PeriodType,
          start_date: `${currentYear}-09-15`,
          end_date: `${currentYear}-11-30`,
          school_year_id: schoolYearId,
        },
        {
          name: 'Composition 2',
          period_type: 'COMPOSITION_2' as PeriodType,
          start_date: `${currentYear}-12-01`,
          end_date: `${currentYear + 1}-02-28`,
          school_year_id: schoolYearId,
        },
        {
          name: 'Composition 3',
          period_type: 'COMPOSITION_3' as PeriodType,
          start_date: `${currentYear + 1}-03-01`,
          end_date: `${currentYear + 1}-04-30`,
          school_year_id: schoolYearId,
        },
        {
          name: 'Composition de passage',
          period_type: 'PASSAGE' as PeriodType,
          start_date: `${currentYear + 1}-05-01`,
          end_date: `${currentYear + 1}-07-04`,
          school_year_id: schoolYearId,
        },
      ];
    }

    if (
      schoolType === 'LYCEE_TECHNIQUE' ||
      schoolType === 'LYCEE_PROFESSIONNEL'
    ) {
      return [
        {
          name: 'Semestre 1',
          period_type: 'SEMESTRE_1' as PeriodType,
          start_date: `${currentYear}-09-15`,
          end_date: `${currentYear + 1}-01-31`,
          school_year_id: schoolYearId,
        },
        {
          name: 'Semestre 2',
          period_type: 'SEMESTRE_2' as PeriodType,
          start_date: `${currentYear + 1}-02-01`,
          end_date: `${currentYear + 1}-07-04`,
          school_year_id: schoolYearId,
        },
      ];
    }
    // SECONDAIRE (collège + lycée général) → 3 trimestres
    return [
      {
        name: 'Trimestre 1',
        period_type: 'TRIMESTRE_1' as PeriodType,
        start_date: `${currentYear}-09-15`,
        end_date: `${currentYear}-12-20`,
        school_year_id: schoolYearId,
      },
      {
        name: 'Trimestre 2',
        period_type: 'TRIMESTRE_2' as PeriodType,
        start_date: `${currentYear + 1}-01-06`,
        end_date: `${currentYear + 1}-04-04`,
        school_year_id: schoolYearId,
      },
      {
        name: 'Trimestre 3',
        period_type: 'TRIMESTRE_3' as PeriodType,
        start_date: `${currentYear + 1}-04-14`,
        end_date: `${currentYear + 1}-07-04`,
        school_year_id: schoolYearId,
      },
    ];
  }
}
