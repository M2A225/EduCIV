import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersRepository } from './teachers.repository';

describe('TeachersService', () => {
  let service: TeachersService;

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
        TeachersService,
        { provide: TeachersRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a teacher', async () => {
      const dto = {
        name: 'Jean Dupont',
        email: 'jean@mail.com',
        hire_date: '2025-09-01',
      };
      const created = { id: 1, ...dto, school_id: 1 };
      mockRepo.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockRepo.create).toHaveBeenCalledWith({
        name: 'Jean Dupont',
        phone: undefined,
        email: 'jean@mail.com',
        grade: undefined,
        specialty: undefined,
        hire_date: new Date('2025-09-01'),
        address: undefined,
      });
      expect(result).toEqual(created);
    });

    it('should handle missing hire_date', async () => {
      const dto = { name: 'Jean Dupont' };
      mockRepo.create.mockResolvedValue({ id: 1 });

      await service.create(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ hire_date: undefined }),
      );
    });
  });

  describe('list', () => {
    it('should return paginated teachers', async () => {
      const teachers = [{ id: 1, name: 'Jean Dupont' }];
      mockRepo.find.mockResolvedValue(teachers);

      const result = await service.list(1, 20);

      expect(mockRepo.find).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        select: {
          id: true,
          name: true,
          grade: true,
          specialty: true,
          assignments: {
            select: { subject: { select: { id: true, name: true } } },
          },
        },
      });
      expect(result).toEqual(teachers);
    });
  });

  describe('getById', () => {
    it('should return a teacher by id', async () => {
      const teacher = { id: 1, name: 'Jean Dupont' };
      mockRepo.findOne.mockResolvedValue(teacher);

      const result = await service.getById(1);

      expect(result).toEqual(teacher);
    });

    it('should throw NotFoundException if teacher not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a teacher', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, name: 'Jean' });
      const updated = { id: 1, name: 'Jean Modified' };
      mockRepo.update.mockResolvedValue(updated);

      const result = await service.update(1, {
        name: 'Jean Modified',
        hire_date: '2025-10-01',
      });

      expect(mockRepo.update).toHaveBeenCalledWith(1, {
        name: 'Jean Modified',
        phone: undefined,
        email: undefined,
        grade: undefined,
        specialty: undefined,
        hire_date: new Date('2025-10-01'),
        address: undefined,
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if teacher not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a teacher', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1 });
      mockRepo.delete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if teacher not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
