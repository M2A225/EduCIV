import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePeriodDto, UpdatePeriodDto } from './dto/create-period.dto';
import { PeriodsRepository } from './periods.repository';

@Injectable()
export class PeriodsService {
  constructor(private readonly periodsRepo: PeriodsRepository) {}

  async create(dto: CreatePeriodDto) {
    return this.periodsRepo.create({
      name: dto.name,
      period_type: dto.period_type,
      start_date: dto.start_date,
      end_date: dto.end_date,
      school_year_id: dto.school_year_id,
    });
  }

  async list(page = 1, pageSize = 50) {
    return this.periodsRepo.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { start_date: 'asc' },
      include: { school_year: true },
    });
  }

  async getById(id: number) {
    const period = await this.periodsRepo.findOne({
      where: { id },
      include: { school_year: true },
    });
    if (!period) throw new NotFoundException('Période introuvable');
    return period;
  }

  async update(id: number, dto: UpdatePeriodDto) {
    const period = await this.periodsRepo.findOne({ where: { id } });
    if (!period) throw new NotFoundException('Période introuvable');
    return this.periodsRepo.update(id, dto);
  }

  async remove(id: number) {
    const period = await this.periodsRepo.findOne({ where: { id } });
    if (!period) throw new NotFoundException('Période introuvable');
    return this.periodsRepo.delete(id);
  }
}
