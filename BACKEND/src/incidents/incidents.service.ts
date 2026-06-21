import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateIncidentDto,
  UpdateIncidentDto,
} from './dto/create-incident.dto';
import { IncidentsRepository } from './incidents.repository';
import type { Incident } from '@prisma/client';

@Injectable()
export class IncidentsService {
  constructor(private readonly incidentsRepo: IncidentsRepository) {}

  async create(dto: CreateIncidentDto): Promise<Incident> {
    return this.incidentsRepo.create({
      student_id: dto.student_id,
      teacher_id: dto.teacher_id,
      type: dto.type,
      description: dto.description,
      date: dto.date ? new Date(dto.date) : new Date(),
      status: 'EN_COURS',
    });
  }

  async list(page: number, pageSize: number): Promise<Incident[]> {
    return this.incidentsRepo.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { created_at: 'desc' },
    });
  }

  async getById(id: number): Promise<Incident> {
    const incident = await this.incidentsRepo.findOne({ where: { id } });
    if (!incident) throw new NotFoundException('Incident introuvable');
    return incident;
  }

  async update(id: number, dto: UpdateIncidentDto): Promise<Incident> {
    await this.getById(id);
    return this.incidentsRepo.update(id, dto);
  }

  async remove(id: number) {
    await this.getById(id);
    return this.incidentsRepo.delete(id);
  }
}
