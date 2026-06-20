import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PaymentAuditLog } from '@prisma/client';
import { BaseRepository } from '../core/base.repository';
import { PrismaService } from '../core/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class AuditRepository extends BaseRepository<PaymentAuditLog> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST)
    request: any,
  ) {
    super(prisma.paymentAuditLog, request);
  }

  async log(action: string, data: any): Promise<PaymentAuditLog> {
    return this.create({ action, data });
  }
}
