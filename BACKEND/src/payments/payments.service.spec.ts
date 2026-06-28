import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';
import { AuditRepository } from './audit.repository';
import { PrismaService } from '../core/prisma.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentsRepo: PaymentsRepository;

  const mockTx = {
    payment: {
      create: jest.fn().mockResolvedValue({
        id: 1, amount_fcfa: 1000, receipt_number: 'R123',
        receipt_hash: 'hash123', payment_type: 'SCOLARITE',
        payment_date: new Date(), student_id: 1, status: 'VALIDE', school_id: 1,
      }),
      findFirst: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    paymentAuditLog: {
      create: jest.fn().mockResolvedValue({ id: 1 }),
    },
  };

  const mockPrismaService = {
    $transaction: jest.fn().mockImplementation((cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx)),
    payment: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    paymentPlan: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PaymentsRepository,
          useValue: { findByReceiptNumber: jest.fn(), currentSchoolId: 1, find: jest.fn() },
        },
        {
          provide: AuditRepository,
          useValue: { find: jest.fn() },
        },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    paymentsRepo = module.get<PaymentsRepository>(PaymentsRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    it('should create a payment and log audit', async () => {
      (paymentsRepo.findByReceiptNumber as jest.Mock).mockResolvedValue(null);

      const dto = {
        amount_fcfa: 1000, receipt_number: 'R123',
        payment_type: 'SCOLARITE', payment_date: '2025-01-15', student_id: 1,
      };
      const result = await service.createPayment(dto);

      expect(result).toBeDefined();
      expect(mockTx.payment.create).toHaveBeenCalled();
      expect(mockTx.paymentAuditLog.create).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate receipt', async () => {
      (paymentsRepo.findByReceiptNumber as jest.Mock).mockResolvedValue({ id: 1 });

      await expect(
        service.createPayment({
          amount_fcfa: 1000, receipt_number: 'R123',
          payment_type: 'SCOLARITE', payment_date: '2025-01-15', student_id: 1,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('cancelPayment', () => {
    it('should cancel a payment', async () => {
      mockTx.payment.findFirst.mockResolvedValue({ id: 1, status: 'VALIDE' });
      mockTx.payment.update.mockResolvedValue({ id: 1, status: 'ANNULE' });

      const result = await service.cancelPayment(1);

      expect(result).toBeDefined();
      expect(mockTx.paymentAuditLog.create).toHaveBeenCalled();
    });

    it('should throw if payment not found', async () => {
      mockTx.payment.findFirst.mockResolvedValue(null);

      await expect(service.cancelPayment(999)).rejects.toThrow(ConflictException);
    });

    it('should throw if already cancelled', async () => {
      mockTx.payment.findFirst.mockResolvedValue({ id: 1, status: 'ANNULE' });

      await expect(service.cancelPayment(1)).rejects.toThrow(ConflictException);
    });
  });

  describe('list', () => {
    it('should return paginated payments', async () => {
      const payments = [{ id: 1, amount_fcfa: 1000 }];
      (paymentsRepo.find as jest.Mock).mockResolvedValue(payments);

      const result = await service.list(1, 20);

      expect(result).toEqual(payments);
    });
  });

  describe('getAudit', () => {
    it('should return audit logs', async () => {
      const logs = [{ id: 1, action: 'CREATION' }];
      (service as any).auditRepo = { find: jest.fn().mockResolvedValue(logs) };

      const auditRepo = { find: jest.fn().mockResolvedValue(logs) };
      (service as any).auditRepo = auditRepo;

      const result = await service.getAudit(1, 20);

      expect(result).toEqual(logs);
    });
  });

  describe('getStats', () => {
    it('should return payment stats', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([
        { amount_fcfa: 1000, status: 'VALIDE', payment_type: 'SCOLARITE', payment_date: new Date(), plan_id: null },
        { amount_fcfa: 500, status: 'ANNULE', payment_type: 'SCOLARITE', payment_date: new Date(), plan_id: null },
      ]);
      mockPrismaService.payment.groupBy.mockResolvedValue([]);

      const result = await service.getStats();

      expect(result.totalReceived).toBe(1000);
      expect(result.totalCancelled).toBe(500);
      expect(result.totalTransactions).toBe(2);
    });
  });

  describe('getPlanStats', () => {
    it('should return plan stats', async () => {
      mockPrismaService.paymentPlan.findMany.mockResolvedValue([
        { id: 1, name: 'Plan 1', total_amount: 5000, payments: [{ amount_fcfa: 2000 }, { amount_fcfa: 1000 }] },
      ]);

      const result = await service.getPlanStats();

      expect(result).toHaveLength(1);
      expect(result[0].collected).toBe(3000);
      expect(result[0].remaining).toBe(2000);
    });
  });
});
