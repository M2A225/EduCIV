import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ReportCard } from '@prisma/client';
import { BaseRepository } from '../core/base.repository';
import { PrismaService } from '../core/prisma.service';
import type { RequestWithUser } from '../auth/types';

@Injectable({ scope: Scope.REQUEST })
export class ReportCardsRepository extends BaseRepository<ReportCard> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST)
    request: RequestWithUser,
  ) {
    super(prisma.reportCard, request);
  }
}
