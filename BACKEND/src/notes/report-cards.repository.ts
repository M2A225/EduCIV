import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ReportCard } from '@prisma/client';
import { BaseRepository } from '../core/base.repository';
import { PrismaService } from '../core/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class ReportCardsRepository extends BaseRepository<ReportCard> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST)
    request: any,
  ) {
    super(prisma.reportCard, request);
  }
}
