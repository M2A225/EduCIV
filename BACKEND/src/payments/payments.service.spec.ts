import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';
import { AuditRepository } from './audit.repository';
import { PrismaService } from '../core/prisma.service';
import { mockPrismaService } from '../../test/prisma-mock';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentsRepo: PaymentsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PaymentsRepository,
          useValue: {
            findByReceiptNumber: jest.fn(),
            currentSchoolId: 'school_1',
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
    mockPrismaService.payment.create.mockResolvedValue({ id: 1, amount_fcfa: 1000 });

    const dto = { amount_fcfa: 1000, receipt_number: 'R123' };
    const result = await service.createPayment(dto);

    expect(result).toBeDefined();
    expect(mockPrismaService.payment.create).toHaveBeenCalled();
    expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
  });
});
