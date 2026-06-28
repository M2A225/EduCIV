import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsRepository } from './subjects.repository';

describe('SubjectsService', () => {
  let service: SubjectsService;

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
        SubjectsService,
        { provide: SubjectsRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a subject', async () => {
      const dto = { name: 'Mathématiques', coefficient: 4 };
      mockRepo.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(result.name).toBe('Mathématiques');
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple subjects', async () => {
      mockRepo.create
        .mockResolvedValueOnce({ id: 1, name: 'Maths', coefficient: 4 })
        .mockResolvedValueOnce({ id: 2, name: 'Français', coefficient: 3 });

      const result = await service.bulkCreate([
        { name: 'Maths', coefficient: 4 },
        { name: 'Français', coefficient: 3 },
      ]);

      expect(result).toHaveLength(2);
      expect(mockRepo.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('list', () => {
    it('should return paginated subjects', async () => {
      const subjects = [{ id: 1, name: 'Math', coefficient: 4 }];
      mockRepo.findMany.mockResolvedValue(subjects);

      const result = await service.list(1, 20);

      expect(mockRepo.findMany).toHaveBeenCalledWith({
        skip: 0, take: 20, orderBy: { name: 'asc' },
      });
      expect(result).toEqual(subjects);
    });
  });

  describe('getById', () => {
    it('should return a subject by id', async () => {
      const subject = { id: 1, name: 'Math', coefficient: 4 };
      mockRepo.findOne.mockResolvedValue(subject);

      const result = await service.getById(1);

      expect(result).toEqual(subject);
    });

    it('should throw if subject not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow('Matière introuvable');
    });
  });

  describe('update', () => {
    it('should update a subject', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, name: 'Math' });
      mockRepo.update.mockResolvedValue({ id: 1, name: 'Math Updated' });

      const result = await service.update(1, { name: 'Math Updated' });

      expect(mockRepo.update).toHaveBeenCalledWith(1, { name: 'Math Updated' });
      expect(result.name).toBe('Math Updated');
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a subject', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1 });
      mockRepo.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove(1);

      expect(mockRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
