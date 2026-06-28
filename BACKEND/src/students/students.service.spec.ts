import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsRepository } from './students.repository';
import { PrismaService } from '../core/prisma.service';
import { StorageService } from '../storage/storage.service';

describe('StudentsService', () => {
  let service: StudentsService;

  const mockRepo = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockPrisma = {
    student: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockStorage = {
    uploadFile: jest.fn(),
    getPublicUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: StudentsRepository, useValue: mockRepo },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StorageService, useValue: mockStorage },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createStudent', () => {
    it('should create a student', async () => {
      const dto = { name: 'Jean', matricule: 'M001', class_id: 1 };
      const created = { id: 1, ...dto };
      mockRepo.create.mockResolvedValue(created);

      const result = await service.createStudent(dto);

      expect(result).toEqual(created);
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Jean', matricule: 'M001' }),
      );
    });
  });

  describe('getByUserId', () => {
    it('should return student by user id', async () => {
      const student = { id: 1, user_id: 1, name: 'Jean' };
      mockRepo.findOne.mockResolvedValue(student);

      const result = await service.getByUserId(1);

      expect(result).toEqual(student);
    });

    it('should return null if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.getByUserId(999);

      expect(result).toBeNull();
    });
  });

  describe('listAll', () => {
    it('should return paginated students', async () => {
      const students = [{ id: 1, name: 'Jean' }];
      mockRepo.find.mockResolvedValue(students);

      const result = await service.listAll(1, 20);

      expect(result).toEqual(students);
      expect(mockRepo.find).toHaveBeenCalledWith({ skip: 0, take: 20 });
    });
  });

  describe('getById', () => {
    it('should return student by id', async () => {
      const student = { id: 1, name: 'Jean' };
      mockRepo.findOne.mockResolvedValue(student);

      const result = await service.getById(1);

      expect(result).toEqual(student);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a student', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, name: 'Jean' });
      const updated = { id: 1, name: 'Jean Updated' };
      mockRepo.update.mockResolvedValue(updated);

      const result = await service.update(1, { name: 'Jean Updated' });

      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('uploadStudentPhoto', () => {
    it('should upload photo and update student', async () => {
      mockPrisma.student.findUnique.mockResolvedValue({ id: 1, school_id: 1 });
      mockStorage.uploadFile.mockResolvedValue(undefined);
      mockStorage.getPublicUrl.mockReturnValue('http://example.com/photo.png');
      mockPrisma.student.update.mockResolvedValue({ id: 1, avatar_url: 'http://example.com/photo.png' });

      const file = { buffer: Buffer.from(''), mimetype: 'image/png' } as Express.Multer.File;
      const result = await service.uploadStudentPhoto(1, file);

      expect(mockStorage.uploadFile).toHaveBeenCalled();
      expect(result.avatar_url).toBe('http://example.com/photo.png');
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);
      const file = { buffer: Buffer.from(''), mimetype: 'image/png' } as Express.Multer.File;

      await expect(service.uploadStudentPhoto(999, file)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
