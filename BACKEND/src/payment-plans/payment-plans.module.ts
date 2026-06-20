import { Module } from '@nestjs/common';
import { PaymentPlansController } from './payment-plans.controller';
import { PaymentPlansService } from './payment-plans.service';
import { PaymentPlansRepository } from './payment-plans.repository';

@Module({
  controllers: [PaymentPlansController],
  providers: [PaymentPlansService, PaymentPlansRepository],
  exports: [PaymentPlansService],
})
export class PaymentPlansModule {}
