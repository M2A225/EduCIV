import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { SyncOperation } from '@prisma/client';
import { BaseRepository } from '../core/base.repository';
import { PrismaService } from '../core/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class SyncRepository extends BaseRepository<SyncOperation> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST)
    request: any,
  ) {
    super(prisma.syncOperation, request.user?.school_id);
  }

  async findByClientId(client_operation_id: string): Promise<SyncOperation | null> {
    return this.prisma.syncOperation.findFirst({
      where: { client_operation_id, school_id: this.schoolId },
    });
  }
}
