import { Injectable, NotFoundException } from '@nestjs/common';
import { ParentsRepository } from './parents.repository';
import { LinkParentDto } from './dto/link-parent.dto';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class ParentsService {
  constructor(
    private readonly parentsRepo: ParentsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async linkParent(dto: LinkParentDto, school_id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.student_id },
    });
    if (!student) throw new NotFoundException('Élève non trouvé');

    const parent = await this.prisma.user.findUnique({
      where: { id: dto.parent_user_id },
    });
    if (!parent) throw new NotFoundException('Parent non trouvé');

    return this.parentsRepo.createLink(
      dto.student_id,
      dto.parent_user_id,
      school_id,
      dto.relation,
    );
  }

  async getStudentParents(student_id: number, school_id: number) {
    return this.parentsRepo.findLinksByStudent(student_id, school_id);
  }

  async getParentStudents(parent_user_id: number, school_id: number) {
    return this.parentsRepo.findLinksByParent(parent_user_id, school_id);
  }

  async unlinkParent(
    student_id: number,
    parent_user_id: number,
    school_id: number,
  ) {
    const link = await this.prisma.studentParent.findUnique({
      where: {
        student_id_parent_user_id: { student_id, parent_user_id },
      },
    });
    if (!link || link.school_id !== school_id) {
      throw new NotFoundException('Lien parent introuvable');
    }
    return this.parentsRepo.removeLink(student_id, parent_user_id);
  }
}
