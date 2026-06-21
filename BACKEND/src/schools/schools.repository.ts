import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { School } from '@prisma/client';
import { BaseRepository } from '../core/base.repository';
import { PrismaService } from '../core/prisma.service';
import type { RequestWithUser } from '../auth/types';

@Injectable({ scope: Scope.REQUEST })
export class SchoolsRepository extends BaseRepository<School> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST)
    request: RequestWithUser,
  ) {
    super(prisma.school, request);
  }
}
