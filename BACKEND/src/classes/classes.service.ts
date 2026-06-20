import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClassDto, UpdateClassDto } from './dto/create-class.dto';
import { ClassesRepository } from './classes.repository';

@Injectable()
export class ClassesService {
  constructor(private readonly classesRepo: ClassesRepository) {}

  async create(dto: CreateClassDto) {
    return this.classesRepo.create(dto);
  }

  async list(page = 1, pageSize = 20, includeStudents = false) {
    return this.classesRepo.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
      ...(includeStudents ? { include: { students: true } } : {}),
    });
  }

  async getById(id: number) {
    const cls = await this.classesRepo.findOne({ where: { id } });
    if (!cls) throw new NotFoundException('Classe introuvable');
    return cls;
  }

  async update(id: number, dto: UpdateClassDto) {
    await this.getById(id);
    return this.classesRepo.update(id, dto);
  }

  async remove(id: number) {
    await this.getById(id);
    return this.classesRepo.delete(id);
  }
}
