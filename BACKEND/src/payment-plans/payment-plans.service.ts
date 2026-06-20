import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentPlansRepository } from './payment-plans.repository';
import { CreatePaymentPlanDto } from './dto/create-payment-plan.dto';
import { UpdatePaymentPlanDto } from './dto/update-payment-plan.dto';

@Injectable()
export class PaymentPlansService {
  constructor(private readonly repo: PaymentPlansRepository) {}

  async create(dto: CreatePaymentPlanDto) {
    return this.repo.create(dto);
  }

  async bulkCreate(plans: { name: string; total_amount: number }[]) {
    const results: any[] = [];
    for (const plan of plans) {
      const created = await this.repo.create(plan);
      results.push(created);
    }
    return results;
  }

  async list() {
    return this.repo.find({ orderBy: { name: 'asc' } });
  }

  async getOne(id: number) {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan de paiement introuvable');
    return plan;
  }

  async update(id: number, dto: UpdatePaymentPlanDto) {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan de paiement introuvable');
    return this.repo.update(id, dto);
  }

  async delete(id: number) {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan de paiement introuvable');
    return this.repo.delete(id);
  }
}
