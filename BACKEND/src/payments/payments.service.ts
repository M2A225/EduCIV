import { Injectable, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from '../entities/payment.entity';
import { PaymentsRepository } from './payments.repository';
import { AuditRepository } from './audit.repository';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
	constructor(
		private readonly paymentsRepo: PaymentsRepository,
		private readonly auditRepo: AuditRepository,
		private readonly dataSource: DataSource,
	) {}

	private generateHash(receiptNumber: string, amount: number): string {
		return crypto.createHash('sha256').update(`${receiptNumber}-${amount}-${Date.now()}`).digest('hex');
	}

	async createPayment(dto: CreatePaymentDto) {
		const exists = await this.paymentsRepo.findByReceiptNumber(dto.receipt_number);
		if (exists) throw new ConflictException('Duplicate receipt number');

		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			// Note: We use the repository but inside a transaction if possible.
			// However, since BaseRepository wraps a specific repository instance, 
			// we might need to use the manager for transaction safety while still 
			// respecting the multi-tenant logic.
			
			const receipt_hash = this.generateHash(dto.receipt_number, dto.amount_fcfa);
			
			const pay = queryRunner.manager.create(Payment, {
				amount_fcfa: dto.amount_fcfa,
				receipt_number: dto.receipt_number,
				receipt_hash,
				status: 'SUCCESS',
				school_id: this.paymentsRepo.currentSchoolId,
			});

			const created = await queryRunner.manager.save(pay);
			
			// Audit log with old_data/new_data as per rules
			await queryRunner.manager.save('audit_logs', {
				action: 'PAYMENT_CREATE',
				data: { old_data: null, new_data: created },
				school_id: this.paymentsRepo.currentSchoolId,
			});

			await queryRunner.commitTransaction();
			return created;
		} catch (err) {
			await queryRunner.rollbackTransaction();
			throw err;
		} finally {
			await queryRunner.release();
		}
	}

	async list(page: number, pageSize: number) {
		return this.paymentsRepo.find({ skip: (page - 1) * pageSize, take: pageSize });
	}

	async getAudit() {
		return this.auditRepo.find();
	}
}
