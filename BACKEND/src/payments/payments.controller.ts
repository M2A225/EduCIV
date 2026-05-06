import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
	constructor(private readonly paymentsService: PaymentsService) {}

	@Post()
	async create(@Body() body: CreatePaymentDto) {
		const p = await this.paymentsService.createPayment(body);
		return { success: true, data: p, error: null };
	}

	@Get()
	async list(@Query() q: PaginationDto) {
		const payments = await this.paymentsService.list(q.page, q.pageSize);
		return { success: true, data: payments, error: null };
	}

	@Get('audit')
	async audit() {
		const a = await this.paymentsService.getAudit();
		return { success: true, data: a, error: null };
	}
}
