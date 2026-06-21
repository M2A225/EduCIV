import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsRepository } from './students.repository';
import { PrismaService } from '../core/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentsRepo: StudentsRepository,
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async uploadStudentPhoto(studentId: number, file: Express.Multer.File) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException('Étudiant non trouvé');

    const path = `${student.school_id}/avatars/student_${studentId}.png`;

    await this.storage.uploadFile(
      'documents',
      path,
      file.buffer,
      file.mimetype,
    );
    const url = this.storage.getPublicUrl('documents', path);

    return this.prisma.student.update({
      where: { id: studentId },
      data: { avatar_url: url },
    });
  }

  async createStudent(dto: CreateStudentDto) {
    return this.studentsRepo.create({
      name: dto.name,
      matricule: dto.matricule,
      dob: dto.dob ? new Date(dto.dob) : undefined,
      place_birth: dto.place_birth,
      sexe: dto.sexe,
      nationality: dto.nationality,
      is_repeater: dto.is_repeater,
      regime: dto.regime,
      is_internal: dto.is_internal,
      class_id: dto.class_id,
    });
  }

  async getByUserId(userId: number) {
    const student = await this.studentsRepo.findOne({
      where: { user_id: userId },
      include: { class: true },
    });
    return student;
  }

  async listAll(page = 1, pageSize = 20) {
    return this.studentsRepo.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async getById(id: number) {
    const student = await this.studentsRepo.findOne({ where: { id } });
    if (!student) throw new NotFoundException('Élève non trouvé');
    return student;
  }

  async update(id: number, dto: UpdateStudentDto) {
    await this.getById(id);
    return this.studentsRepo.update(id, {
      name: dto.name,
      matricule: dto.matricule,
      dob: dto.dob ? new Date(dto.dob) : undefined,
      place_birth: dto.place_birth,
      sexe: dto.sexe,
      nationality: dto.nationality,
      is_repeater: dto.is_repeater,
      regime: dto.regime,
      is_internal: dto.is_internal,
      class_id: dto.class_id,
    });
  }
}
