import { Test, TestingModule } from '@nestjs/testing';
import { TimetablesService } from './timetables.service';
import { TimetablesRepository } from './timetables.repository';
import { PrismaService } from '../core/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

const mockRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findMany: jest.fn(),
};

const mockPrisma = {
  subject: { findUnique: jest.fn() },
  teacher: { findUnique: jest.fn() },
  class: { findUnique: jest.fn() },
};

describe('TimetablesService', () => {
  let service: TimetablesService;
  let repo: TimetablesRepository;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimetablesService,
        { provide: TimetablesRepository, useValue: mockRepo },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TimetablesService>(TimetablesService);
    repo = module.get<TimetablesRepository>(TimetablesRepository);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      class_id: 1,
      teacher_id: 2,
      subject_id: 3,
      slot: 'MON_08:00',
      school_id: 1,
    };

    it('should throw if subject not found', async () => {
      mockPrisma.subject.findUnique.mockResolvedValue(null);
      mockPrisma.teacher.findUnique.mockResolvedValue({ id: 2 });
      mockPrisma.class.findUnique.mockResolvedValue({ id: 1 });
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw if teacher not found', async () => {
      mockPrisma.subject.findUnique.mockResolvedValue({ id: 3 });
      mockPrisma.teacher.findUnique.mockResolvedValue(null);
      mockPrisma.class.findUnique.mockResolvedValue({ id: 1 });
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw if class not found', async () => {
      mockPrisma.subject.findUnique.mockResolvedValue({ id: 3 });
      mockPrisma.teacher.findUnique.mockResolvedValue({ id: 2 });
      mockPrisma.class.findUnique.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on schedule conflict', async () => {
      mockPrisma.subject.findUnique.mockResolvedValue({ id: 3 });
      mockPrisma.teacher.findUnique.mockResolvedValue({ id: 2 });
      mockPrisma.class.findUnique.mockResolvedValue({ id: 1 });
      mockRepo.findMany.mockResolvedValue([
        { id: 10, class_id: 1, teacher_id: 5, slot: 'MON_08:00' },
      ]);
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should create a timetable entry', async () => {
      mockPrisma.subject.findUnique.mockResolvedValue({ id: 3 });
      mockPrisma.teacher.findUnique.mockResolvedValue({ id: 2 });
      mockPrisma.class.findUnique.mockResolvedValue({ id: 1 });
      mockRepo.findMany.mockResolvedValue([]);
      mockRepo.create.mockResolvedValue({ id: 1, ...dto });
      const result = await service.create(dto);
      expect(result.id).toBe(1);
    });
  });

  describe('list', () => {
    it('should list timetables with default pagination', async () => {
      mockRepo.findMany.mockResolvedValue([]);
      await service.list();
      expect(mockRepo.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 100,
        where: undefined,
        include: { class: true, teacher: true, subject: true },
      });
    });

    it('should filter by classId', async () => {
      mockRepo.findMany.mockResolvedValue([]);
      await service.list(1, 50, 2);
      expect(mockRepo.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 50,
        where: { class_id: 2 },
        include: { class: true, teacher: true, subject: true },
      });
    });
  });
});
