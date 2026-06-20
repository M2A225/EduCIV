import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PaymentPlansService } from './payment-plans.service';
import { CreatePaymentPlanDto } from './dto/create-payment-plan.dto';
import { UpdatePaymentPlanDto } from './dto/update-payment-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payment-plans')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PaymentPlansController {
  constructor(private readonly service: PaymentPlansService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('bulk')
  @Roles('DIRECTOR', 'BACKOFFICE', 'ACCOUNTANT')
  async bulkCreate(
    @Body() body: { plans: { name: string; total_amount: number }[] },
  ) {
    const data = await this.service.bulkCreate(body.plans);
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @Roles('DIRECTOR', 'BACKOFFICE', 'ACCOUNTANT')
  async create(@Body() dto: CreatePaymentPlanDto) {
    const data = await this.service.create(dto);
    return { success: true, data, error: null };
  }

  @Get()
  async list() {
    const data = await this.service.list();
    return { success: true, data, error: null };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const data = await this.service.getOne(Number(id));
    return { success: true, data, error: null };
  }

  @Patch(':id')
  @Roles('DIRECTOR', 'BACKOFFICE', 'ACCOUNTANT')
  async update(@Param('id') id: string, @Body() dto: UpdatePaymentPlanDto) {
    const data = await this.service.update(Number(id), dto);
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @Roles('DIRECTOR', 'BACKOFFICE', 'ACCOUNTANT')
  async remove(@Param('id') id: string) {
    await this.service.delete(Number(id));
    return { success: true, data: null, error: null };
  }
}
