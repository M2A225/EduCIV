import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { BaseRepository } from '../core/base.repository';
import { PrismaService } from '../core/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class IncidentsRepository extends BaseRepository<any> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) request: any,
  ) {
    super(prisma.incident, request);
  }
}
