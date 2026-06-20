import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @Roles('ACCOUNTANT', 'DIRECTOR', 'BACKOFFICE')
  async create(@Body() body: CreatePaymentDto) {
    const p = await this.paymentsService.createPayment(body);
    return { success: true, data: p, error: null };
  }

  @Get()
  @Roles('ACCOUNTANT', 'DIRECTOR', 'BACKOFFICE', 'CASHIER')
  async list(@Query() q: PaginationDto) {
    const payments = await this.paymentsService.list(q.page, q.pageSize);
    return { success: true, data: payments, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post(':id/cancel')
  @Roles('ACCOUNTANT', 'DIRECTOR', 'BACKOFFICE')
  async cancel(@Param('id') id: string) {
    const p = await this.paymentsService.cancelPayment(Number(id));
    return { success: true, data: p, error: null };
  }

  @Get('audit')
  @Roles('ACCOUNTANT', 'DIRECTOR', 'BACKOFFICE')
  async audit() {
    const a = await this.paymentsService.getAudit();
    return { success: true, data: a, error: null };
  }

  @Get('stats')
  @Roles('ACCOUNTANT', 'DIRECTOR', 'BACKOFFICE')
  async stats() {
    const s = await this.paymentsService.getStats();
    return { success: true, data: s, error: null };
  }

  @Get('plan-stats')
  @Roles('ACCOUNTANT', 'DIRECTOR', 'BACKOFFICE')
  async planStats() {
    const s = await this.paymentsService.getPlanStats();
    return { success: true, data: s, error: null };
  }
}
