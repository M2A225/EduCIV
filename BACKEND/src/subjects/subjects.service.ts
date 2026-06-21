import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/create-subject.dto';
import { SubjectsRepository } from './subjects.repository';

@Injectable()
export class SubjectsService {
  constructor(private readonly subjectsRepo: SubjectsRepository) {}

  async create(dto: CreateSubjectDto) {
    return this.subjectsRepo.create(dto);
  }

  async bulkCreate(
    subjects: {
      name: string;
      coefficient: number;
      max_score?: number;
      level_group?: string;
    }[],
  ) {
    const results: Awaited<ReturnType<typeof this.subjectsRepo.create>>[] = [];
    for (const subject of subjects) {
      const data = { ...subject, level_group: subject.level_group || '' };
      const created = await this.subjectsRepo.create(data);
      results.push(created);
    }
    return results;
  }

  async list(page = 1, pageSize = 20) {
    return this.subjectsRepo.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: number) {
    const subject = await this.subjectsRepo.findOne({ where: { id } });
    if (!subject) throw new NotFoundException('Matière introuvable');
    return subject;
  }

  async update(id: number, dto: UpdateSubjectDto) {
    const subject = await this.subjectsRepo.findOne({ where: { id } });
    if (!subject) throw new NotFoundException('Matière introuvable');
    return this.subjectsRepo.update(id, dto);
  }

  async remove(id: number) {
    const subject = await this.subjectsRepo.findOne({ where: { id } });
    if (!subject) throw new NotFoundException('Matière introuvable');
    return this.subjectsRepo.delete(id);
  }
}
