import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';
import { AuditRepository } from './audit.repository';

const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() },
};

const mockDataSource = { 
  createQueryRunner: jest.fn(() => mockQueryRunner) 
};

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
        { provide: DataSource, useValue: mockDataSource },
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
    mockQueryRunner.manager.create.mockReturnValue({ id: 1, amount_fcfa: 1000 });
    mockQueryRunner.manager.save.mockResolvedValue({ id: 1, amount_fcfa: 1000 });

    const dto = { amount_fcfa: 1000, receipt_number: 'R123' };
    const result = await service.createPayment(dto);

    expect(result).toBeDefined();
    expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(2); // Payment + AuditLog
  });
});
