import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class ParentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createLink(
    student_id: number,
    parent_user_id: number,
    school_id: number,
    relation?: string,
  ) {
    return this.prisma.studentParent.create({
      data: { student_id, parent_user_id, school_id, relation },
      include: { student: true, parent: true },
    });
  }

  async findLinksByStudent(student_id: number, school_id: number) {
    return this.prisma.studentParent.findMany({
      where: { student_id, school_id },
      include: { parent: true },
    });
  }

  async findLinksByParent(parent_user_id: number, school_id: number) {
    return this.prisma.studentParent.findMany({
      where: { parent_user_id, school_id },
      include: { student: true },
    });
  }

  async removeLink(student_id: number, parent_user_id: number) {
    return this.prisma.studentParent.delete({
      where: {
        student_id_parent_user_id: { student_id, parent_user_id },
      },
    });
  }
}
