import { Injectable, ConflictException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsRepository } from './payments.repository';
import { AuditRepository } from './audit.repository';
import { PrismaService } from '../core/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
	constructor(
		private readonly paymentsRepo: PaymentsRepository,
		private readonly auditRepo: AuditRepository,
		private readonly prisma: PrismaService,
	) {}

	private generateHash(receiptNumber: string, amount: number): string {
		return crypto.createHash('sha256').update(`${receiptNumber}-${amount}-${Date.now()}`).digest('hex');
	}

	async createPayment(dto: CreatePaymentDto) {
		const exists = await this.paymentsRepo.findByReceiptNumber(dto.receipt_number);
		if (exists) throw new ConflictException('Duplicate receipt number');

		return await this.prisma.$transaction(async (tx) => {
			const receipt_hash = this.generateHash(dto.receipt_number, dto.amount_fcfa);
			
			const created = await tx.payment.create({
				data: {
					amount_fcfa: dto.amount_fcfa,
					receipt_number: dto.receipt_number,
					receipt_hash,
					status: 'SUCCESS',
					school_id: this.paymentsRepo.currentSchoolId!,
				}
			});
			
			await tx.auditLog.create({
				data: {
					action: 'PAYMENT_CREATE',
					data: JSON.stringify({ new_data: created }),
					school_id: this.paymentsRepo.currentSchoolId!,
				},
			});

			return created;
		});
	}

	async list(page: number, pageSize: number) {
		return this.paymentsRepo.find({ skip: (page - 1) * pageSize, take: pageSize });
	}

	async getAudit() {
		return this.auditRepo.find();
	}
}
