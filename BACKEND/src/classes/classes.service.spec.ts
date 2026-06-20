import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassesRepository } from './classes.repository';

describe('ClassesService', () => {
  let service: ClassesService;

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
        ClassesService,
        { provide: ClassesRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a class', async () => {
      const dto = { name: '6ème A', level: '6ème' };
      const created = { id: 1, ...dto, school_id: 1 };
      mockRepo.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('list', () => {
    it('should return paginated classes', async () => {
      const classes = [{ id: 1, name: '6ème A' }];
      mockRepo.find.mockResolvedValue(classes);

      const result = await service.list(1, 20, false);

      expect(mockRepo.find).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
      });
      expect(result).toEqual(classes);
    });

    it('should include students when requested', async () => {
      mockRepo.find.mockResolvedValue([]);

      await service.list(1, 20, true);

      expect(mockRepo.find).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        include: { students: true },
      });
    });
  });

  describe('getById', () => {
    it('should return a class by id', async () => {
      const cls = { id: 1, name: '6ème A' };
      mockRepo.findOne.mockResolvedValue(cls);

      const result = await service.getById(1);

      expect(result).toEqual(cls);
    });

    it('should throw NotFoundException if class not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a class', async () => {
      const cls = { id: 1, name: '6ème A' };
      mockRepo.findOne.mockResolvedValue(cls);
      const updated = { id: 1, name: '6ème B' };
      mockRepo.update.mockResolvedValue(updated);

      const result = await service.update(1, { name: '6ème B' });

      expect(mockRepo.update).toHaveBeenCalledWith(1, { name: '6ème B' });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if class not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, { name: 'Test' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a class', async () => {
      const cls = { id: 1, name: '6ème A' };
      mockRepo.findOne.mockResolvedValue(cls);
      mockRepo.delete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if class not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
