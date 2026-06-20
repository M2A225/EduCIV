import { Injectable, ConflictException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsRepository } from './payments.repository';
import { AuditRepository } from './audit.repository';
import { PrismaService } from '../core/prisma.service';
import { PaymentType } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepo: PaymentsRepository,
    private readonly auditRepo: AuditRepository,
    private readonly prisma: PrismaService,
  ) {}

  private generateHash(receiptNumber: string, amount: number): string {
    return crypto
      .createHash('sha256')
      .update(`${receiptNumber}-${amount}-${Date.now()}`)
      .digest('hex');
  }

  async createPayment(dto: CreatePaymentDto) {
    const exists = await this.paymentsRepo.findByReceiptNumber(
      dto.receipt_number,
    );
    if (exists) throw new ConflictException('Numéro de reçu en double');

    const schoolId = this.paymentsRepo.currentSchoolId!;

    return await this.prisma.$transaction(async (tx) => {
      const receipt_hash = this.generateHash(
        dto.receipt_number,
        dto.amount_fcfa,
      );

      const created = await tx.payment.create({
        data: {
          amount_fcfa: dto.amount_fcfa,
          receipt_number: dto.receipt_number,
          receipt_hash,
          payment_type: dto.payment_type as PaymentType,
          payment_date: new Date(dto.payment_date),
          student_id: dto.student_id,
          plan_id: dto.plan_id,
          status: 'VALIDE',
          school_id: schoolId,
        },
      });

      await tx.paymentAuditLog.create({
        data: {
          payment_id: created.id,
          action: 'CREATION',
          data: JSON.stringify({ new_data: created }),
          school_id: schoolId,
        },
      });

      return created;
    });
  }

  async cancelPayment(id: number) {
    const schoolId = this.paymentsRepo.currentSchoolId!;

    return await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { id, school_id: schoolId },
      });
      if (!payment) throw new ConflictException('Paiement introuvable');
      if (payment.status === 'ANNULE')
        throw new ConflictException('Paiement déjà annulé');

      const updated = await tx.payment.update({
        where: { id },
        data: { status: 'ANNULE' },
      });

      await tx.paymentAuditLog.create({
        data: {
          payment_id: updated.id,
          action: 'ANNULATION',
          data: JSON.stringify({ old_data: payment, new_data: updated }),
          school_id: schoolId,
        },
      });

      return updated;
    });
  }

  async list(page: number, pageSize: number) {
    return this.paymentsRepo.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { student: true, plan: true },
    });
  }

  async getAudit(page = 1, pageSize = 20) {
    return this.auditRepo.find({ skip: (page - 1) * pageSize, take: pageSize });
  }

  async getStats() {
    const schoolId = this.paymentsRepo.currentSchoolId!;
    const allPayments = await this.prisma.payment.findMany({
      where: { school_id: schoolId },
      select: {
        amount_fcfa: true,
        status: true,
        payment_type: true,
        payment_date: true,
        plan_id: true,
      },
    });

    const totalReceived = allPayments
      .filter((p) => p.status === 'VALIDE')
      .reduce((sum, p) => sum + p.amount_fcfa, 0);

    const totalCancelled = allPayments
      .filter((p) => p.status === 'ANNULE')
      .reduce((sum, p) => sum + p.amount_fcfa, 0);

    const today = new Date().toDateString();
    const todayReceived = allPayments
      .filter(
        (p) =>
          p.status === 'VALIDE' &&
          new Date(p.payment_date).toDateString() === today,
      )
      .reduce((sum, p) => sum + p.amount_fcfa, 0);

    const byType: Record<string, number> = {};
    for (const p of allPayments.filter((p) => p.status === 'VALIDE')) {
      byType[p.payment_type] = (byType[p.payment_type] || 0) + p.amount_fcfa;
    }

    const byMonth: Record<string, number> = {};
    for (const p of allPayments.filter((p) => p.status === 'VALIDE')) {
      const key = new Date(p.payment_date).toISOString().slice(0, 7);
      byMonth[key] = (byMonth[key] || 0) + p.amount_fcfa;
    }

    const planTotals = await this.prisma.payment.groupBy({
      by: ['plan_id'],
      where: { school_id: schoolId, status: 'VALIDE', plan_id: { not: null } },
      _sum: { amount_fcfa: true },
      _count: true,
    });

    return {
      totalReceived,
      totalCancelled,
      todayReceived,
      todayCount: allPayments.filter(
        (p) =>
          p.status === 'VALIDE' &&
          new Date(p.payment_date).toDateString() === today,
      ).length,
      totalTransactions: allPayments.length,
      byType,
      byMonth,
      planTotals,
    };
  }

  async getPlanStats() {
    const schoolId = this.paymentsRepo.currentSchoolId!;
    const plans = await this.prisma.paymentPlan.findMany({
      where: { school_id: schoolId },
      include: {
        payments: {
          where: { status: 'VALIDE' },
          select: { amount_fcfa: true },
        },
      },
    });

    return plans.map((plan) => {
      const collected = plan.payments.reduce(
        (sum, p) => sum + p.amount_fcfa,
        0,
      );
      return {
        id: plan.id,
        name: plan.name,
        total_amount: plan.total_amount,
        collected,
        remaining: plan.total_amount - collected,
        paymentCount: plan.payments.length,
      };
    });
  }
}
