import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/create-teacher.dto';
import { TeachersRepository } from './teachers.repository';

@Injectable()
export class TeachersService {
  constructor(private readonly teachersRepo: TeachersRepository) {}

  async create(dto: CreateTeacherDto) {
    return this.teachersRepo.create({
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      grade: dto.grade,
      specialty: dto.specialty,
      hire_date: dto.hire_date ? new Date(dto.hire_date) : undefined,
      address: dto.address,
    });
  }

  async list(page = 1, pageSize = 20) {
    return this.teachersRepo.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        grade: true,
        specialty: true,
        assignments: {
          select: { subject: { select: { id: true, name: true } } },
        },
      },
    });
  }

  async getById(id: number) {
    const teacher = await this.teachersRepo.findOne({ where: { id } });
    if (!teacher) throw new NotFoundException('Enseignant non trouvé');
    return teacher;
  }

  async update(id: number, dto: UpdateTeacherDto) {
    await this.getById(id);
    return this.teachersRepo.update(id, {
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      grade: dto.grade,
      specialty: dto.specialty,
      hire_date: dto.hire_date ? new Date(dto.hire_date) : undefined,
      address: dto.address,
    });
  }

  async remove(id: number) {
    await this.getById(id);
    return this.teachersRepo.delete(id);
  }
}
