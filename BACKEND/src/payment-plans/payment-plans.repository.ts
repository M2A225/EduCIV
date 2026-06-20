import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PaymentPlan } from '@prisma/client';
import { BaseRepository } from '../core/base.repository';
import { PrismaService } from '../core/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class PaymentPlansRepository extends BaseRepository<PaymentPlan> {
  constructor(
    readonly prisma: PrismaService,
    @Inject(REQUEST)
    request: any,
  ) {
    super(prisma.paymentPlan, request);
  }
}
