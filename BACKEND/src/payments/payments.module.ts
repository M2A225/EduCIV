import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';
import { AuditRepository } from './audit.repository';

@Module({
  imports: [],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository, AuditRepository],
  exports: [PaymentsService],
})
export class PaymentsModule {}
