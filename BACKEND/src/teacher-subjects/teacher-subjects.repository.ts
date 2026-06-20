import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { TeacherSubject } from '@prisma/client';
import { BaseRepository } from '../core/base.repository';
import { PrismaService } from '../core/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class TeacherSubjectsRepository extends BaseRepository<TeacherSubject> {
  constructor(
    readonly prisma: PrismaService,
    @Inject(REQUEST)
    request: any,
  ) {
    super(prisma.teacherSubject, request);
  }
}
