import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Grade } from '@prisma/client';
import { BaseRepository } from '../core/base.repository';
import { PrismaService } from '../core/prisma.service';
import { RequestWithUser } from '../auth/types';

@Injectable({ scope: Scope.REQUEST })
export class NotesRepository extends BaseRepository<Grade> {
  constructor(
    readonly prisma: PrismaService,
    @Inject(REQUEST)
    request: RequestWithUser,
  ) {
    super(prisma.grade, request);
  }

  async getStudentGrades(studentId: number, periodId: number) {
    return this.findMany({
      where: {
        student_id: studentId,
        period_id: periodId,
      },
      include: {
        subject: true,
      },
    });
  }
}
