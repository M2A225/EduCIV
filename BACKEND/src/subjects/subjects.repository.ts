import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Subject } from '@prisma/client';
import { BaseRepository } from '../core/base.repository';
import { PrismaService } from '../core/prisma.service';
import type { RequestWithUser } from '../auth/types';

@Injectable({ scope: Scope.REQUEST })
export class SubjectsRepository extends BaseRepository<Subject> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST)
    request: RequestWithUser,
  ) {
    super(prisma.subject, request);
  }
}
