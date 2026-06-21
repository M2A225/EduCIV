import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Payment } from '@prisma/client';
import { BaseRepository } from '../core/base.repository';
import { PrismaService } from '../core/prisma.service';
import { RequestWithUser } from '../auth/types';

@Injectable({ scope: Scope.REQUEST })
export class PaymentsRepository extends BaseRepository<Payment> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST)
    request: RequestWithUser,
  ) {
    super(prisma.payment, request);
  }

  async findByReceiptNumber(receipt_number: string): Promise<Payment | null> {
    return this.prisma.payment.findFirst({
      where: { receipt_number, school_id: this.schoolId },
    });
  }
}
