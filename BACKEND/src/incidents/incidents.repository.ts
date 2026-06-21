import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from '../core/base.repository';
import { PrismaService } from '../core/prisma.service';
import { RequestWithUser } from '../auth/types';
import type { Incident } from '@prisma/client';

@Injectable({ scope: Scope.REQUEST })
export class IncidentsRepository extends BaseRepository<Incident> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) request: RequestWithUser,
  ) {
    super(prisma.incident, request);
  }
}
