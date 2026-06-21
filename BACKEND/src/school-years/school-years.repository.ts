import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { SchoolYear } from '@prisma/client';
import { BaseRepository } from '../core/base.repository';
import { PrismaService } from '../core/prisma.service';
import { RequestWithUser } from '../auth/types';

@Injectable({ scope: Scope.REQUEST })
export class SchoolYearsRepository extends BaseRepository<SchoolYear> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST)
    request: RequestWithUser,
  ) {
    super(prisma.schoolYear, request);
  }
}
