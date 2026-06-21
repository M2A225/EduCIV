import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PaymentPlansService } from './payment-plans.service';
import { PaymentPlansRepository } from './payment-plans.repository';

describe('PaymentPlansService', () => {
  let service: PaymentPlansService;

  const mockRepo = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentPlansService,
        { provide: PaymentPlansRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<PaymentPlansService>(PaymentPlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a payment plan', async () => {
      const dto = { name: 'Plan A', total_amount: 50000 };
      const created = { id: 1, ...dto, school_id: 1 };
      mockRepo.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple payment plans', async () => {
      const plans = [
        { name: 'Plan A', total_amount: 50000 },
        { name: 'Plan B', total_amount: 75000 },
      ];
      mockRepo.create
        .mockResolvedValueOnce({ id: 1, ...plans[0] })
        .mockResolvedValueOnce({ id: 2, ...plans[1] });

      const result = await service.bulkCreate(plans);

      expect(mockRepo.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });

    it('should return empty array for empty input', async () => {
      const result = await service.bulkCreate([]);

      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('list', () => {
    it('should return all payment plans', async () => {
      const plans = [{ id: 1, name: 'Plan A' }];
      mockRepo.find.mockResolvedValue(plans);

      const result = await service.list();

      expect(mockRepo.find).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
      expect(result).toEqual(plans);
    });
  });

  describe('getOne', () => {
    it('should return a payment plan by id', async () => {
      const plan = { id: 1, name: 'Plan A' };
      mockRepo.findOne.mockResolvedValue(plan);

      const result = await service.getOne(1);

      expect(result).toEqual(plan);
    });

    it('should throw NotFoundException if plan not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.getOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a payment plan', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, name: 'Plan A' });
      const updated = { id: 1, name: 'Plan B' };
      mockRepo.update.mockResolvedValue(updated);

      const result = await service.update(1, { name: 'Plan B' });

      expect(mockRepo.update).toHaveBeenCalledWith(1, { name: 'Plan B' });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if plan not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a payment plan', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1 });
      mockRepo.delete.mockResolvedValue(undefined);

      await service.delete(1);

      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if plan not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
