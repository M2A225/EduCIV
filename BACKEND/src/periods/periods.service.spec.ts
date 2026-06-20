import { Test, TestingModule } from '@nestjs/testing';
import { PeriodsService } from './periods.service';
import { PeriodsRepository } from './periods.repository';

describe('PeriodsService', () => {
  let service: PeriodsService;

  const mockRepo = {
    create: jest.fn(),
    findMany: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeriodsService,
        { provide: PeriodsRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<PeriodsService>(PeriodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a period', async () => {
      const dto = {
        name: 'Trimestre 1',
        start_date: '2025-09-15',
        end_date: '2025-12-20',
      };
      mockRepo.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(result.name).toBe('Trimestre 1');
    });
  });

  describe('list', () => {
    it('should return paginated periods', async () => {
      const periods = [{ id: 1, name: 'Trimestre 1' }];
      mockRepo.findMany.mockResolvedValue(periods);

      const result = await service.list(1, 20);

      expect(mockRepo.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        orderBy: { start_date: 'asc' },
        include: { school_year: true },
      });
      expect(result).toEqual(periods);
    });
  });

  describe('getById', () => {
    it('should return a period by id', async () => {
      const period = { id: 1, name: 'Trimestre 1' };
      mockRepo.findOne.mockResolvedValue(period);

      const result = await service.getById(1);

      expect(result).toEqual(period);
    });

    it('should throw if period not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow('Période introuvable');
    });
  });
});
