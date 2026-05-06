import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AuditLog } from '@prisma/client';
import { BaseRepository } from '../core/base.repository';
import { PrismaService } from '../core/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class AuditRepository extends BaseRepository<AuditLog> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST)
    request: any,
  ) {
    super(prisma.auditLog, request.user?.school_id);
  }

  async log(action: string, data: any): Promise<AuditLog> {
    return this.create({ action, data });
  }
}
