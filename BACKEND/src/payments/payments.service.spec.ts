import { Test, TestingModule } from '@nestjs/testing';
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
        id: 1,
        amount_fcfa: 1000,
        receipt_number: 'R123',
        receipt_hash: 'hash123',
        payment_type: 'SCOLARITE',
        payment_date: new Date(),
        student_id: 1,
        status: 'VALIDE',
        school_id: 1,
      }),
    },
    paymentAuditLog: {
      create: jest.fn().mockResolvedValue({ id: 1 }),
    },
  };

  const mockPrismaService = {
    $transaction: jest.fn().mockImplementation(async (cb) => cb(mockTx)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PaymentsRepository,
          useValue: {
            findByReceiptNumber: jest.fn(),
            currentSchoolId: 1,
          },
        },
        {
          provide: AuditRepository,
          useValue: {
            find: jest.fn(),
          },
        },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    paymentsRepo = module.get<PaymentsRepository>(PaymentsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a payment and log audit', async () => {
    (paymentsRepo.findByReceiptNumber as jest.Mock).mockResolvedValue(null);

    const dto = {
      amount_fcfa: 1000,
      receipt_number: 'R123',
      payment_type: 'SCOLARITE',
      payment_date: '2025-01-15',
      student_id: 1,
    };
    const result = await service.createPayment(dto);

    expect(result).toBeDefined();
    expect(mockTx.payment.create).toHaveBeenCalled();
    expect(mockTx.paymentAuditLog.create).toHaveBeenCalled();
  });
});
