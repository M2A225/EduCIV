import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';
import { AuditRepository } from './audit.repository';
import { Payment } from '../entities/payment.entity';
import { AuditLog } from '../entities/audit_log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, AuditLog])],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository, AuditRepository],
  exports: [PaymentsService],
})
export class PaymentsModule {}
