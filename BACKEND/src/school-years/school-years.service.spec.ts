import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SchoolYearsService } from './school-years.service';
import { SchoolYearsRepository } from './school-years.repository';
import { PeriodsService } from '../periods/periods.service';
import { PrismaService } from '../core/prisma.service';
import { mockPrismaService } from '../../test/prisma-mock';

describe('SchoolYearsService', () => {
  let service: SchoolYearsService;
  const prisma = mockPrismaService;

  const mockRepo = {
    findMany: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    currentSchoolId: 1 as number | undefined,
  };

  const mockPeriodsService = {
    create: jest.fn(),
    list: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchoolYearsService,
        { provide: SchoolYearsRepository, useValue: mockRepo },
        { provide: PeriodsService, useValue: mockPeriodsService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SchoolYearsService>(SchoolYearsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a school year with periods in a transaction', async () => {
      mockRepo.currentSchoolId = 1;
      const schoolYear = { id: 1, year_range: '2025-2026', school_id: 1 };
      const school = { id: 1, school_type: 'SECONDAIRE' };

      prisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          schoolYear: {
            create: jest.fn().mockResolvedValue(schoolYear),
            findUnique: jest
              .fn()
              .mockResolvedValue({ ...schoolYear, periods: [] }),
          },
          school: {
            findUnique: jest.fn().mockResolvedValue(school),
          },
          academicPeriod: {
            createMany: jest.fn().mockResolvedValue({ count: 3 }),
          },
        };
        return cb(tx);
      });

      const result = await service.create({ year_range: '2025-2026' });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if no schoolId', async () => {
      mockRepo.currentSchoolId = undefined;

      await expect(
        service.create({ year_range: '2025-2026' } as Record<string, unknown>),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('list', () => {
    it('should return paginated school years', async () => {
      const years = [{ id: 1, year_range: '2025-2026' }];
      mockRepo.findMany.mockResolvedValue(years);

      const result = await service.list(1, 20);

      expect(mockRepo.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        orderBy: { id: 'desc' },
        include: { periods: { orderBy: { start_date: 'asc' } } },
      });
      expect(result).toEqual(years);
    });
  });

  describe('getById', () => {
    it('should return a school year by id', async () => {
      const year = { id: 1, year_range: '2025-2026', periods: [] };
      mockRepo.findOne.mockResolvedValue(year);

      const result = await service.getById(1);

      expect(result).toEqual(year);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a school year', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1 });
      const updated = { id: 1, year_range: '2026-2027' };
      mockRepo.update.mockResolvedValue(updated);

      const result = await service.update(1, {
        year_range: '2026-2027',
      });

      expect(mockRepo.update).toHaveBeenCalledWith(1, {
        year_range: '2026-2027',
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, { year_range: 'Test' } as Record<string, unknown>),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a school year', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1 });
      mockRepo.delete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
